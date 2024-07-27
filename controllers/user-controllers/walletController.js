const { User } = require('../../models/userSchema');
const Razorpay = require("razorpay");
const crypto = require('crypto');

let instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

let addMoneyToWallet = async (req, res) => {
    try {
        const amountInRupees = parseInt(req.body.total);
        const options = {
            amount: amountInRupees * 100, // Convert to paise
            currency: "INR",
            receipt: "" + Date.now(),
        };

        instance.orders.create(options, async (error, order) => {
            if (error) {
                console.log("Error while creating order:", error);
                return res.status(500).json({ error: "Error while creating order" });
            } else {
                const amount = order.amount / 100; // Convert to rupees
                
                res.json({
                    order: order,
                    razorpay: true
                });
            }
        });
    } catch (error) {
        console.log("Something went wrong", error);
        res.status(500).send("Internal Server Error");
    }
};

const verifyPayment = async (req, res) => {
    try {
        const details = req.body;
        console.log(details)
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(details.response.razorpay_order_id + "|" + details.response.razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== details.response.razorpay_signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        const amount = parseInt(details.order.amount) / 100;
        console.log(amount) // Convert to rupees
        await User.updateOne(
            {
                _id: req.session.user._id
            },
            {
                $inc: {
                    wallet: amount
                }
            }
        );
        await User.updateOne(
            {
                _id: req.session.user._id
            },
            {
                $push: {
                    history: {
                        amount: amount,
                        status: "credit",
                        date: Date.now()
                    }
                }
            }
        );

        res.json({
            success: true
        });
    } catch (error) {
        console.log("Something went wrong", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    addMoneyToWallet,
    verifyPayment
};
