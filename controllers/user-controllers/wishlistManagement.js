const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Cart = require("../../models/cart")
const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')
const ObjectId = require('mongoose')
// const Swal = require('sweetalert2')
const swal = require('sweetalert')

let userData
const showWishlistPage = async (req, res) => {
    const userData = req.session.user;

    try {
        const userId = userData._id;

        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ user: new mongoose.Types.ObjectId(userId) });
        const wishlistCount = wishlist ? (wishlist.productId ? wishlist.productId.length : 0) : 0;

        // Fetch the cart items
        const cartItems = await Cart.find({ userId: new mongoose.Types.ObjectId(userId) });
        const cartProductIds = cartItems.map(item => item.product_Id.toString());

        // Aggregate the wishlist products
        // const WishListProd = await Wishlist.aggregate([
        //     {
        //         $match: { user: new mongoose.Types.ObjectId(userId) }
        //     },
        //     {
        //         $unwind: '$productId'
        //     },
        //     {
        //         $lookup: {
        //             from: 'products',
        //             foreignField: '_id',
        //             localField: 'productId',
        //             as: 'product'
        //         }
        //     }
        // ]);

        //const userId = '66d80315bcd026be63344730'; // Replace with dynamic userId

        const WishListProd = await Wishlist.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) } // Match user's wishlist
            },
            {
                $unwind: '$productId' // Unwind the array of product IDs
            },
            {
                $lookup: {
                    from: 'products', // Join with products collection
                    localField: 'productId', // Field from wishlist
                    foreignField: '_id', // Field from products
                    as: 'product' // Output array with matched products
                }
            },
            {
                $unwind: '$product' // Flatten the products array
            },
            {
                $project: {
                    _id: 1, // include wishlist ID
                    productId: 1, // Include product ID
                    product: {
                        _id: 1,
                        name: 1,
                        price: 1,
                        discountprice: 1,
                        description: 1,
                        category: 1,
                        image: 1,
                        stock: 1,
                        isBlocked: 1,
                        popularity: 1,
                        bestSelling: 1,
                        brand: 1,
                        createdOn: 1
                    } // Include desired fields from product
                }
            }
        ]);

        console.log(WishListProd, "WishListProd");

        if (WishListProd.length > 0) {
            res.render('user/wishlist', { userData, WishListProd, wishCt: wishlistCount });
        } else {
            res.render('user/emptyWishlist', { userData });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const addToWishList = async (req, res) => {
    try {
        let { id } = req.body
        console.log(req.body, "reqqqqqqqqqqqqqqq")
        console.log(id, "id to remove")
        // const Id = id.toString()
        const userId = req.session.user
        // console.log(Id)
        let productData = await Product.findById(id).lean()
        console.log(productData._id)
        const productId = new mongoose.Types.ObjectId(id);


        let wishlistData = await Wishlist.updateOne(
            {
                user: userId
            },
            {
                $addToSet: {
                    productId: productId,

                }

            },
            {
                upsert: true,
                new: true
            }
        )
        if (wishlistData.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }


        console.log(wishlistData)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }

}
const removeFromWishList = async (req, res) => {
    try {
        let { id, wishId } = req.body
        console.log("this is pr id :", id, wishId, "iddddddddddd")



        let productIdToRemove = new mongoose.Types.ObjectId(id);
        const wishListId = new mongoose.Types.ObjectId(wishId);


        let wishlistUpdateResult = await Wishlist.updateOne(
            { _id: wishListId },
            { $pull: { productId: productIdToRemove } }
        );
        if (wishlistUpdateResult.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }

}

module.exports = {
    showWishlistPage,
    addToWishList,
    removeFromWishList
}