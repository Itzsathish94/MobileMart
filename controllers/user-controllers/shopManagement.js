const { Product } = require('../../models/productsSchema') 
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const mongoose = require('mongoose')


const shopPage = async (req, res) => {
    let userData = false;
    if (req.session.user) {

        const user = req.session.user;
        const id = user._id
        userData = await User.findById(id).lean();
        console.log(userData , "USERDATAAA")

    }
    try {
       
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
       
        const count = await Product.find({ isBlocked: false }).count()
        const categories = await Category.find({ isListed: true }).lean()

        //////////////
        const totalPages = Math.ceil(count/limit)  // Example value
        const pages = Array.from({length: totalPages}, (_, i) => i + 1);
        const newProducts = await Product.find({}).sort({createdAt:-1}).limit(3).lean()
        
        res.render('user/shop', { products,pages , userData , newProducts , currentPage: page , loadCatData:categories,  count })
    } catch (error) {
        console.log(error)
    }
}

const searchAndSort= async (req, res) => {
    const { searchQuery, sortOption, categoryFilter, page, limit } = req.body;

    // Construct the match stage
    const matchStage = { $match: {} };
    if (searchQuery) {
         matchStage.$match.name = { $regex: searchQuery, $options: 'i' };
    }
    if (categoryFilter) {
        matchStage.$match.category = new mongoose.Types.ObjectId(categoryFilter);
    }
    // Construct the sort stage
    const sortStage = { $sort: {} };
    switch (sortOption) {
        case 'priceAsc':
            sortStage.$sort.price = 1;
            break;
        case 'priceDesc':
            sortStage.$sort.price = -1;
            break;
        case 'nameAsc':
            sortStage.$sort.name = 1;
            break;
        case 'nameDesc':
            sortStage.$sort.name = -1;
            break;
        case 'newArrivals':
            sortStage.$sort.createdOn = -1;
            break;
        case 'popularity':
            sortStage.$sort.popularity = -1; 
            break;
        default:
            sortStage.$sort.createdOn = 1; 
    }

    const skipStage = { $skip: (page - 1) * limit };
    const limitStage = { $limit: limit };

    const products = await Product.aggregate([
        matchStage,
        {
            $lookup: {
                from: 'category',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
            }
        },
        sortStage,
        skipStage,
        limitStage
    ]);
   // console.log(products)

    const totalProducts = await Product.countDocuments(matchStage.$match);

    res.json({ products, totalProducts });
}

module.exports = {
    shopPage,
    searchAndSort
}