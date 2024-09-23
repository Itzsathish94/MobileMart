const { Product } = require('../../models/productsSchema')
const { Category } = require('../../models/categorySchema');
const { Brand } = require('../../models/brands');
const mongoose = require('mongoose')
const ObjectId = require('mongoose')


////render products list page in admin page
const showproductslist = async (req, res) => {
  try {
    console.log("Fetching products...");
    var page = 1
    if (req.query.page) {
      page = req.query.page
    }
    console.log(page)
    let limit = 5
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'category',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit * 1
      }
    ])
    const count = await Product.find({}).count()
    const totalPages = Math.ceil(count / limit)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    console.log(products);
    res.render('admin/products', { products, pages, currentPage: page, admin: true, layout: 'adminlayout' });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).send("Internal Server Error");
  }
}

///add products to the products list
const addproduct_page = async (req, res) => {
  try {
    const categories = await Category.find().lean()


    const brandData = await Brand.aggregate([
      {
        $match: {
          isListed: true
        }
      }
    ]);

    console.log(brandData);
    res.render('admin/addProduct', { admin: true, categories, brandData, layout: 'adminlayout' })

  } catch (error) {
    console.log(error);

  }
}
const addproduct = async (req, res) => {
  try {
    const files = req.files
    const images = []
    files.forEach((file) => {
      const image = file.filename;
      images.push(image);
    });

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      brand: req.body.brand,
      image: images,
      discountprice: req.body.discountprice
    });
    await newProduct.save().then(result => {
      res.redirect('/admin/products')
      console.log(newProduct)
    })
      .catch(err => console.log(err))

  } catch (error) {
    console.error("Error creating Product:", error)

  }
}

const deleteproduct = async (req, res) => {
  try {
    const { id } = req.body
    console.log(req.body);
    const productdata = await Product.findById(id)
    const isBlocked = productdata.is_blocked;
    console.log(isBlocked)
    await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          is_blocked: !isBlocked,
        },
      })
    res.json({ success: true })
  } catch (error) {
    console.log(error)

  }
}

/////complete delete of product
const fullDeleteProd = async (req, res) => {
  try {
    let { id } = req.body
    await Product.findByIdAndDelete(id)
    res.json({ success: true })

  } catch (error) {
    console.log(error)

  }
}

/////edit product
const showeditprodpage = async (req, res) => {
  try {

    const prodid = req.params.id
    console.log(prodid)
    const product = await Product.findById({ _id: prodid }).populate('category', 'category').populate('brand', 'brand').lean()
    console.log(product)
    const category = await Category.find().lean()
    console.log(category)
    const brandData = await Brand.aggregate([
      {
        $match: {
          isListed: true
        }
      }
    ]);
    console.log("eedit pr category       ", category)
    console.log(" eedit pr brand  ", brandData)
    console.log('edit product.......', product)


    res.render('admin/editProduct', { admin: true, product, category, brandData, layout: 'adminlayout' })

  } catch (error) {
    console.log(error)
  }
}
const editProduct = async (req, res) => {
  try {
    const Files = req.files
    const prodid = new mongoose.Types.ObjectId(req.params.id)
    console.log(prodid, 'qweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    const product = await Product.findById(prodid).lean()
    console.log(product, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    const extimages = product.image
    let updImages = []
    if (Files && Files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updImages = [...extimages, ...newImages];

    }
    else {
      updImages = extimages
    }
    console.log(req.body, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    const { name, price, description, category, stock, brand, discountprice } = req.body


    await Product.findByIdAndUpdate(prodid,
      {
        name: name,
        price: price,
        description: description,
        category: category,
        image: updImages,
        stock: stock,
        isBlocked: false,
        brand: brand,
        discountprice: discountprice
      },
      { new: true })
    res.redirect('/admin/products')


  } catch (error) {
    console.log(error)
  }
}


const updateProductOffer = async (req, res) => {
  try {
    
    const prodid = new mongoose.Types.ObjectId(req.params.id)
   
    const product = await Product.findById(prodid).lean()
 
   
    const {  discountprice } = req.body


    await Product.findByIdAndUpdate(prodid,
      {
    
        discountprice: discountprice
      },
      { new: true })
    res.redirect('/admin/products')


  } catch (error) {
    console.log(error)
  }
}



const deleteProdImage = async (req, res) => {
  try {

    const { id, image } = req.query
    const product = await Product.findById(id);

    product.image.splice(image, 1);

    await product.save();

    res.status(200).send({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

const blockProducts = async (req, res) => {
  try {
    const { id } = req.body
    console.log(req.body)
    const product = await Product.findById(id)
    let newisBlocked = !product.isBlocked

    await Product.findByIdAndUpdate(id, { isBlocked: newisBlocked })
    res.json({ success: true })

  } catch (error) {
    console.log(error)
  }
}

const showeditprodoffer = async (req, res) => {
  try {

    const prodid = req.params.id
    console.log(prodid)
    const product = await Product.findById({ _id: prodid }).populate('category', 'category').populate('brand', 'brand').lean()
    console.log(product)
    const category = await Category.find().lean()
    console.log(category)
    const brandData = await Brand.aggregate([
      {
        $match: {
          isListed: true
        }
      }
    ]);
    console.log("eedit pr category       ", category)
    console.log(" eedit pr brand  ", brandData)
    console.log('edit product.......', product)


    res.render('admin/editProductOffer', { admin: true, product, category, brandData, layout: 'adminlayout' })

  } catch (error) {
    console.log(error)
  }
}

const removeprodoffer = async (req, res) => {
  try {
    const prodid = req.params.id
    console.log(prodid)

    await Product.findByIdAndUpdate(prodid,
      {
        discountprice: 0 
      },
      { new: true })
    res.redirect('/admin/products')


  } catch (error) {
    console.log(error)
  }

}

module.exports = {
  showproductslist,
  addproduct_page,
  addproduct,
  blockProducts,
  deleteproduct,
  showeditprodpage,
  editProduct,
  fullDeleteProd,
  deleteProdImage,
  showeditprodoffer,
  removeprodoffer,
  updateProductOffer

}

