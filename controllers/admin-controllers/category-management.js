const { Category } = require('../../models/categorySchema')



///// show category page
const categoryPage = async (req, res) => {
    try {
        const category = await Category.find().lean()
        console.log(category)
        res.render('admin/category', { admin: true, category, layout: 'adminlayout' })
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

    let lowcatname = req.body.name.toLowerCase()
    const images = req.file
    try {
        let catexist = await Category.findOne({ category: lowcatname })

        if (!catexist) {
            const category = new Category({
                category: lowcatname,
                image: images.filename
            })
            await category.save().then(result => {
                req.session.catSave = true

                res.redirect('/admin/addCategory')

            })

        }
        else {
            req.session.catExist = true
            res.redirect('/admin/addCategory')

        }




        // res.render('admin/add-category',{admin:true})

    } catch (error) {
        console.log(error)

    }
}

//////show edit category and edit actegory
const showEditCategory = async (req, res) => {
    try {
        const catId = req.params.id
        const cat = await Category.findById(catId).lean()
        res.render('admin/editCategory', { admin: true, cat, layout: 'adminlayout' })

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
        const catId = req.params.id
        await Category.findByIdAndDelete(catId)
        res.redirect('/admin/category')
    } catch (error) {

        console.log(error)
    }
}
const unListCategory = async (req, res) => {
    try {
        const catId = req.params.id
        let user=await Category.findById(catId)
        let newListed=user.isListed

        await Category.findByIdAndUpdate(catId, {
            isListed: !newListed
        },
            { new: true })
        res.redirect('/admin/category')



    } catch (error) {
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
    unListCategory

}