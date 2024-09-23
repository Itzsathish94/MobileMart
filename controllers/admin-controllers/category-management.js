const { Category } = require('../../models/categorySchema')
const { Product } = require('../../models/productsSchema')

///// show category page
const categoryPage = async (req, res) => {
    try {
        const category = await Category.find().lean()
        console.log(category)
        res.render('admin/category', { category, layout: 'adminlayout' })
    } catch (error) {
        console.log(error)

    }
}
//// add category /////
const addcategory_page = async (req, res) => {
    let catExistMsg = "Category alredy Exist..!!";
    let catSaveMsg = "Category Added Successfully..!!";
    try {
        if (req.session.catExist) {
            res.render('admin/addCategory', { catExistMsg, layout: 'adminlayout' })
            req.session.catExist = false
        }
        else if (req.session.catSave) {
            res.render('admin/addCategory', { catSaveMsg, layout: 'adminlayout' })
            req.session.catSave = false
        }
        else {
            res.render('admin/addCategory', { layout: 'adminlayout' })
        }
    } catch (error) {
        console.log(error)
    }
}



const addcategory = async (req, res) => {
    let lowcatname = req.body.name.toLowerCase();
    let catOffer = parseInt(req.body.categoryOffer); // Convert categoryOffer to a number
    const images = req.file;

    console.log(catOffer, ".................");

    // Validate the catOffer to ensure it's between 1 and 100
    if (isNaN(catOffer) || catOffer < 1 || catOffer > 100) {
        req.session.catOfferError = true; // Optionally set a session message for invalid offer
        return res.redirect('/admin/addCategory'); // Redirect to the add category page
    }

    try {
        let catexist = await Category.findOne({ category: lowcatname });

        if (!catexist) {
            const category = new Category({
                category: lowcatname,
                categoryOffer: catOffer, // Ensure the offer is saved as a number
                image: images.filename
            });
            await category.save().then(result => {
                req.session.catSave = true;
                res.redirect('/admin/addCategory');
            });
        } else {
            req.session.catExist = true;
            res.redirect('/admin/addCategory');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/admin/addCategory'); // Handle error gracefully with a redirect
    }
};

//////show edit category and edit actegory
const showEditCategory = async (req, res) => {
    try {
        const catId = req.params.id
        const cat = await Category.findById(catId).lean()
        res.render('admin/editCategory', { cat, layout: 'adminlayout' })
    } catch (error) {
        console.log(error)
    }
}
const showCategoryOffer = async (req, res) => {
    try {
        const catId = req.params.id
        const cat = await Category.findById(catId).lean()
        console.log(cat)
        res.render('admin/editCategoryOffer', { cat, layout: 'adminlayout' })
    } catch (error) {
        console.log(error)
    }
}


const editCategoryOffer = async (req, res) => {
    const catId = req.params.id
    console.log(catId)
    let catOffer = parseInt(req.body.categoryOffer); // Convert categoryOffer to a number
  

    console.log(catOffer, ".................");

    // Validate the catOffer to ensure it's between 1 and 100
    if (isNaN(catOffer) || catOffer < 1 || catOffer > 100) {
        req.session.catOfferError = true; // Optionally set a session message for invalid offer
        return res.redirect('/admin/addCategory'); // Redirect to the add category page
    }

   
    try {
        await Product.updateMany({ category: catId }, { $set: { discountprice: 0 } });
        const updatedCategory = await Category.findByIdAndUpdate(
            catId,
            { categoryOffer: catOffer },
            { new: true } // This option returns the updated document
        );

        if (!updatedCategory) {
            req.session.catOfferError = "Category not found.";
            return res.redirect('/admin/addCategory');
        }

        res.redirect('/admin/category');
    }  catch (error) {
        console.log(error);
        res.redirect('/admin/addCategory'); // Handle error gracefully with a redirect
    }
};


const removeCatOffer = async (req, res) => {
    try {
      const catid = req.params.id
      console.log(catid)
  
      await Category.findByIdAndUpdate(catid,
        {
            categoryOffer: 0 
        },
        { new: true })
      res.redirect('/admin/category')
  
  
    } catch (error) {
      console.log(error)
    }
  
  }

const editCategory = async (req, res) => {
    try {
        const image = req.file
        const catId = req.params.id
        const category = await Category.findById(catId).lean()
        const catImg = category.image
        let updateImg
        if (image) {
            updateImg = image.filename
        }
        else {
            updateImg = catImg
        }
        const catExist = await Category.findOne({ name: req.body.name }).lean()
        if (!catExist) {
            await Category.findByIdAndUpdate(catId, {
                category: req.body.name,
                image: updateImg
            },
                { new: true })
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error)
    }
}
/////delete category////////
const deleteCategory = async (req, res) => {
    try {
        const {id}=req.body
        console.log(req.body)
        await Category.findByIdAndDelete(id)
        res.json({success:true})
    } catch (error) {
        console.log(error)
    }
}
const unListCategory = async (req, res) => {
    try {
        const {id}=req.body
        console.log(req.body)
        let user=await Category.findById(id)
        let newListed=user.isListed
        await Category.findByIdAndUpdate(id, {
            isListed: !newListed
        },
            { new: true })
        res.json({success:true})

        await Product.updateMany({category:id},{$set:{isBlocked: newListed }})

        console.log(error)
    }catch(error){
        console.log(error)
    }
}
module.exports = {
    addcategory,
    addcategory_page,
    categoryPage,
    editCategory,
    showEditCategory,
    deleteCategory,
    unListCategory,
    showCategoryOffer,
    editCategoryOffer,
    removeCatOffer
}