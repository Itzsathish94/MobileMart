const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
// const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')

let userData
const shopPage = async (req, res) => {
    try {
        userData = req.session.user
        let id = userData._id
        var page=1
        if(req.query.page){
            page=req.query.page
        }
        console.log(page)
        let limit=3
        const products = await Product.aggregate([
            {
                $match: {
                    isBlocked: false
                }
            },
            {
                $lookup: {
                    from: 'category',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $skip:(page-1)*limit
            },
            {
                $limit:limit*1
            }
        ])
        // const wishlist = await Wishlist.findOne({ user: new mongoose.Types.ObjectId(id) });
        // const wishlistCount = wishlist ? (wishlist.productId ? wishlist.productId.length : 0) : 0;

        // console.log(wishlistCount)


        // const isInWishlist = await Product.aggregate([
        //     {
        //         $match: {
        //             isBlocked: false
        //         }
        //     },
        //     {
        //         $lookup:{
        //             from:'wishlist',
        //             localField:'_id',
        //             foreignField:'productId',
        //             as:'wishlist'
        //         }
        //     },
        //     {
        //         $match: {
        //             'wishlist.productId': mongoose.Types.ObjectId()
        //         }
        //     }
        // ])
        // console.log(isInWishlist)


        const count = await Product.find({ isBlocked: false }).count()
        const categories = await Category.find({ isListed: true }).lean()

        //////////////
        const totalPages = Math.ceil(count/limit)  // Example value
        const pages = Array.from({length: totalPages}, (_, i) => i + 1);
        // const user=await User.findById(userData._id).lean()
        // console.log(user)
        res.render('user/shop', { products,pages , currentPage: page , categories, userData, count })
    } catch (error) {
        console.log(error)
    }
}
// const loadLowToHigh = async (req, res) => {
//     try {
//         const categories = await Category.find({ isListed: true }).lean()
//         const products = await Product.aggregate([
//             {
//                 $match: {
//                     isBlocked: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'category',
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             {
//                 $unwind: '$category'
//             },
//             {
//                 $sort: {
//                     price: 1
//                 }
//             }
//         ])
//         const count = await Product.find({ isBlocked: false }).count()
//         res.render("user/shop", {
//             products,
//             userData: req.session.user,
//             categories,
//             count
//         })

//     } catch (error) {
//         console.log(error)
//     }
// }

// const loadHighToLow = async (req, res) => {
//     try {
//         const categories = await Category.find({ isListed: true }).lean()
//         const products = await Product.aggregate([
//             {
//                 $match: {
//                     isBlocked: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'category',
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             {
//                 $unwind: '$category'
//             },
//             {
//                 $sort: {
//                     price: -1
//                 }
//             }
//         ])
//         const count = await Product.find({ isBlocked: false }).count()
//         res.render("user/shop", {
//             products,
//             userData: req.session.user,
//             categories,
//             count
//         })

//     } catch (error) {
//         console.log(error)
//     }
// }
// const loadAtoZ = async (req, res) => {
//     try {
//         const categories = await Category.find({ isListed: true }).lean()
//         const products = await Product.aggregate([
//             {
//                 $match: {
//                     isBlocked: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'category',
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             {
//                 $unwind: '$category'
//             },
//             {
//                 $sort: {
//                     name: 1
//                 }
//             }
//         ])
//         const count = await Product.find({ isBlocked: false }).count()
//         res.render("user/shop", {
//             products,
//             userData: req.session.user,
//             categories,
//             count
//         })

//     } catch (error) {
//         console.log(error)
//     }
// }
// const loadZtoA = async (req, res) => {
//     try {
//         const categories = await Category.find({ isListed: true }).lean()
//         const products = await Product.aggregate([
//             {
//                 $match: {
//                     isBlocked: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'category',
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             {
//                 $unwind: '$category'
//             },
//             {
//                 $sort: {
//                     name: -1
//                 }

//             }
//         ])
//         const count = await Product.find({ isBlocked: false }).count()
//         res.render("user/shop", {
//             products,
//             userData: req.session.user,
//             categories,
//             count
//         })

//     } catch (error) {
//         console.log(error)
//     }
// }

// const filterByCategory = async (req, res) => {
    try {
        const ID = req.params.id
        console.log(ID)
        const category = await Category.findOne({ _id: ID })
        const count = await Product.aggregate([
            {
                $match: {
                    isBlocked: false,
                    category: new mongoose.Types.ObjectId(ID) // Match products with the given category ID
                }
            },
            {
                $count: 'count' // Count the documents
            }
        ]);
        console.log(count)
        console.log(category)
        const categories = await Category.find({ isListed: true }).lean()
        const products = await Product.aggregate([
            {
                $match: {
                    isBlocked: false
                }
            },
            {
                $lookup: {
                    from: 'category',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {

                $match: {
                    $expr: {
                        $eq: ['$category.category', category.category] // Filter by category name "console"
                    }
                }
            }
        ])

        console.log(count)
        res.render("user/shop", {
            products,
            userData: req.session.user,
            categories,
            count: count[0].count
        })

    } catch (error) {
        console.log(error)
    }
// }
// const catFilter = async(req, res)=>{
//     try {
//         const id       = req.query.id
            
//         const productData = await Product.find({ category: id,   isBlocked:false })
//         console.log(productData)
        

//         res.json( productData )
//     } catch (error) {
//         console.log(error);
//     }   
// }
// const sortProduct_az = async(req, res) => {
//     try {
//         const { sort, catId } = req.body
      
//         if( catId ){
//             const products = await Product.find({ category : catId }, {isBlocked: false}).sort({ name: sort });
//             res.json(products)   
           
//         } else{
//             const products = await Product.find( {isBlocked: false}).sort({ name: sort });
//             res.json(products)
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }


// const sortProductByPrice = async(req, res) => {
//     try {
//         const { sort, catId } = req.body

//         if(catId){
//             const products = await Product.find({ category : catId }, {isBlocked: false}).sort({ price: sort });
//             res.json(products)
//         }else{               
//         const products = await Product.find({isBlocked: false}).sort({ price: sort });
//         res.json(products)
//          }

//     } catch (error) {
//         console.log(error);
//     }
// }
module.exports = {
    shopPage,
    // loadLowToHigh,
    // loadHighToLow,
    // loadZtoA,
    // loadAtoZ,
    // filterByCategory,
    // sortProduct_az,
    // sortProductByPrice,
    // catFilter
}