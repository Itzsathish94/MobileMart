const { Product } = require('../../models/productsSchema')
const { User } = require('../../models/userSchema')
const { Address } = require('../../models/addressSchema')
const Coupon = require('../../models/couponSchema')
const Order = require('../../models/order')
const moment = require('moment')
const easyinvoice = require('easyinvoice');
const mongoose = require('mongoose')
const {Wallet} = require('../../models/walletSchema');
const { Category } = require('../../models/categorySchema')



const cancelOrder = async (req, res) => {
    try {
        let userData = req.session.user
        const id = req.params.id;
        console.log(id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const ID = new mongoose.Types.ObjectId(id);
        let notCancelledAmt = 0;

        let canceledOrder = await Order.findOne({ _id: ID });

        console.log(".........",canceledOrder)

        if (!canceledOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await Order.updateOne({ _id: ID }, { $set: { status: 'Cancelled' } });

        for (const product of canceledOrder.product) {
            if (!product.isCancelled) {
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { stock: product.quantity }, $set: { isCancelled: true } }
                );

                await Order.updateOne(
                    { _id: ID, 'product._id': product._id },
                    { $set: { 'product.$.isCancelled': true } }
                );
            }
        }
        await Coupon.updateOne(
            { code: canceledOrder.coupon },
            {
                $pull: { usedBy: userData._id }
            }
        );

        if (['wallet', 'razorpay'].includes(canceledOrder.paymentMethod)) {
            // for (const data of canceledOrder.product) {
            //     //await Product.updateOne({ _id: data._id }, { $inc: { stock: data.quantity } });
                
            //     notCancelledAmt += data.price * data.quantity;
            // }
            await Wallet.updateOne(
                { userId: req.session.user._id },
                { $inc: { wallet: canceledOrder.total} }
            );

            await Wallet.updateOne(
                {userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: canceledOrder.total,
                            status: 'refund for Order Cancellation',
                            date: Date.now()
                        }
                    }
                }
            );

        res.json({
            success: true,
            message: 'Successfully cancelled Order'
        });
    }
 } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


// Return entire order
const returnOrder = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const ID = new mongoose.Types.ObjectId(id);
        let notCancelledAmt = 0;

        let returnedOrder = await Order.findOne({ _id: ID }).lean();
        console.log(returnedOrder, "returnedOrder");

        const returnedorder = await Order.findByIdAndUpdate(ID, { $set: { status: 'Returned' } }, { new: true });
        for (const product of returnedorder.product) {
            if (!product.isCancelled) {
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { stock: product.quantity } }
                );

                await Order.updateOne(
                    { _id: ID, 'product._id': product._id },
                    { $set: { 'product.$.isReturned': true } }
                );
            }
        }

        if (['wallet', 'razorpay'].includes(returnedOrder.paymentMethod)) {
            for (const data of returnedOrder.product) {
                notCancelledAmt += data.price * data.quantity;
            }
            if(returnedorder.coupon){
                await Wallet.updateOne(
                    { userId: req.session.user._id },
                    { $inc: { wallet: returnedOrder.total - returnedOrder.discountAmt } }
                );

                await Wallet.updateOne(
                    {userId: req.session.user._id },
                    {
                        $push: {
                            history: {
                                amount: returnedOrder.total - returnedOrder.discountAmt,
                                status: 'refund for Return',
                                date: Date.now()
                            }
                        }
                    }
                );

            }else{
                await Wallet.updateOne(
                    { userId: req.session.user._id },
                    { $inc: { wallet: returnedOrder.total - 50} }
                );
                await Wallet.updateOne(
                {userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: returnedOrder.total - 50,
                            status: 'refund for Return',
                            date: Date.now()
                        }
                    }
                }
            );
            }
        }
        

        res.json({
            success: true,
            message: 'Successfully Returned Order'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const cancelOneProduct = async (req, res) => {
    try {
        const { id, prodId } = req.body;
        console.log(id, prodId);

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(prodId)) {
            return res.status(400).json({ error: 'Invalid order or product ID' });
        }

        const ID = new mongoose.Types.ObjectId(id);
        const PRODID = new mongoose.Types.ObjectId(prodId);

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: ID, 'product._id': PRODID },
            { $set: { 'product.$.isCancelled': true } },
            { new: true }
        ).lean();

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order or product not found' });
        }

        const result = await Order.findOne(
            { _id: ID, 'product._id': PRODID },
            { 'product.$': 1 }
        ).lean();

        const productQuantity = result.product[0].quantity;
        const productprice = (result.product[0].price - result.product[0].discountprice)  * productQuantity ;

        await Product.findOneAndUpdate(
            { _id: PRODID },
            { $inc: { stock: productQuantity } }
        );

        if (updatedOrder.couponUsed) {
            const coupon = await Coupon.findOne({ code: updatedOrder.coupon });
            const discountAmt = (productprice * coupon.discount) / 100;
            const newTotal = productprice - discountAmt;

            await Wallet.updateOne(
                { userId: req.session.user._id },
                { $inc: { wallet: newTotal } }
            );

            await Wallet.updateOne(
                { userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: newTotal,
                            status: `refund of: ${result.product[0].name}`,
                            date: Date.now()
                        }
                    }
                }
            );
        } else {
            await Wallet.updateOne(
                { userId: req.session.user._id },
                { $inc: { wallet: productprice } }
            );

            await Wallet.updateOne(
                { userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: productprice,
                            status: `refund of: ${result.product[0].name}`,
                            date: Date.now()
                        }
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Successfully removed product'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
``

const returnOneProduct = async (req, res) => {
    try {
        const { id, prodId } = req.body;
        console.log(id, prodId);

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(prodId)) {
            return res.status(400).json({ error: 'Invalid order or product ID' });
        }

        const ID = new mongoose.Types.ObjectId(id);
        const PRODID = new mongoose.Types.ObjectId(prodId);

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: ID, 'product._id': PRODID },
            { $set: { 'product.$.isReturned': true } },
            { new: true }
        ).lean();

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order or product not found' });
        }

        const result = await Order.findOne(
            { _id: ID, 'product._id': PRODID },
            { 'product.$': 1,'amountAfterDscnt':1 }
        ).lean();

        const productQuantity = result.product[0].quantity;
        const productprice = (result.product[0].price - result.product[0].discountprice)  * productQuantity ;

        await Product.findOneAndUpdate(
            { _id: PRODID },
            { $inc: { stock: productQuantity } }
        );

        if (updatedOrder.couponUsed) {
            const coupon = await Coupon.findOne({ code: updatedOrder.coupon });
            const discountAmt = (productprice / result.amountAfterDscnt) * 100;
            const newTotal = Math.round(productprice - discountAmt);

            await Wallet.updateOne(
                { userId: req.session.user._id },
                { $inc: { wallet: newTotal } }
            );

            await Wallet.updateOne(
                { userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: newTotal,
                            status: `refund of: ${result.product[0].name}`,
                            date: Date.now()
                        }
                    }
                }
            );
        } else {
            await Wallet.updateOne(
                { userId: req.session.user._id },
                { $inc: { wallet: productprice } }
            );

            await Wallet.updateOne(
                { userId: req.session.user._id },
                {
                    $push: {
                        history: {
                            amount: productprice,
                            status: `refund of: ${result.product[0].name}`,
                            date: Date.now()
                        }
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Successfully returned product'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const getInvoice = async (req, res) => {
    try {
        const orderId = req.query.id;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }

        const { userId, address: addressId } = order;
        const [user, address] = await Promise.all([
            User.findById(userId),
            Address.findById(addressId),
        ]);

        if (!user || !address) {
            return res.status(404).send({ message: 'User or address not found' });
        }

        const products = order.product
            .filter(product => !product.isCancelled && !product.isReturned)
            .map(product => ({
                quantity: product.quantity.toString(),
                description: product.name,
                tax: product.tax,
                price: product.price,
            }));


        const date = moment(order.date).format('MMMM D, YYYY');
        const data = {
            mode: "development",
            currency: 'USD',
            taxNotation: 'vat',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            sender: {
                company: 'MobileMart',
                address: 'Canyon',
                zip: '600091',
                city: 'Chennai',
                country: 'India',
            },
            client: {
                company: user.name,
                address: address.adressLine1,
                zip: address.pin,
                city: address.city,
                country: 'India',
            },
            information: {
                number: `INV-${orderId}`,
                date: date,
            },
            products: products,
        };

        easyinvoice.createInvoice(data, function (result) {
            const fileName = `invoice_${orderId}.pdf`;
            const pdfBuffer = Buffer.from(result.pdf, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.sendStatus(500);
    }
};



const retryPayment = async(req, res)=>{
    try {
        const id = req.query.id
        await Order.findByIdAndUpdate(id, { $set: { status: 'pending' } }, { new: true });

        res.json({
            razorPaySucess: true,
        })
        
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.sendStatus(500);
    }
}


module.exports = {
    cancelOrder, cancelOneProduct,
    returnOrder,
    returnOneProduct,
    getInvoice,
    retryPayment
}