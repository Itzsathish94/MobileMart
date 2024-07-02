const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')




////render products list page in admin page
const showproductslist = async (req, res) => {
  try {
    // Ensure that the database connection is established
    console.log("Fetching products...");
    const products = await Product.aggregate([
      {$lookup:{
        from:'category',
        localField:'category',
        foreignField:'_id',
        as:'category'
      }},
      {$unwind:'$category'},
    ])
    // console.log(products);
    res.render('admin/products', { products, admin: true ,layout:'adminlayout'});
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).send("Internal Server Error");
  }
}

// const showproductslist=async (req,res)=>{


//     try {

//         const products= await Product.find()
//         console.log(products)
//         res.render('admin/products',{ products,admin:true})

//     } catch (error) {
//         console.log("smtg wrong", error);

//     }

// }

///add products to the products list
const addproduct_page = async (req, res) => {


  try {
    const categories = await Category.find().lean()
    //console.log(categories)
    res.render('admin/addProduct', { admin: true, categories ,layout:'adminlayout' })

  } catch (error) {
    console.log(error);

  }
}
const addproduct = async (req, res) => {
  // const name=req.body.name
  // const category=req.body.category
  // const description=req.body.description
  // const image=req.body.image
  try {
    const files = req.files
    const images = []
    files.forEach((file) => {
      const image = file.filename;
      images.push(image);
    });
    // images.push(req.files.filename)
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      //Image: req.body.image
      image: images
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
    let productId = req.params.id;
    const productdata = await Product.findById(productId)
    const isBlocked = productdata.is_blocked;
    console.log(isBlocked)
    await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          is_blocked: !isBlocked,
        },
      })
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)

  }
}
/////complete delte of product
const fullDeleteProd=async(req,res)=>{
  try {
    let productId = req.params.id;
    await Product.findByIdAndDelete(productId)
    res.redirect('/admin/products')
    
  } catch (error) {
    console.log(error)
    
  }
}

/////edit product
const showeditprodpage = async (req, res) => {
  try {

    const prodid = req.params.id
    console.log(prodid)
    const product = await Product.findById({_id:prodid}).lean()
    console.log(product)
    const category = await Category.find().lean()
    console.log(category)
    res.render('admin/editProduct', {admin:true, product, category,layout:'adminlayout' })

  } catch (error) {
    console.log(error)
  }
}
const editProduct=async(req,res)=>{
  try {
    const Files=req.files
    const prodid = req.params.id
    const product = await Product.findById(prodid).lean()
    const extimages=product.image
    let updImages=[]
    // Files.forEach((file)=>{
    //   images.push(file)
    // })
    if(Files && Files.length>0){
      const newImages = req.files.map((file) => file.filename);
      updImages = [...extimages, ...newImages];
      // product.image = updImages;
      
    }
    else{
      updImages=extimages
    }
    const { name, price, description, category, stock } = req.body

      await Product.findByIdAndUpdate(prodid,
      {
        name:name,
        price:price,
        description:description,
        category:category,
        image:updImages,
        stock:stock,
        isBlocked:false
        
        
      },
    {new: true})
      res.redirect('/admin/products')

    
  } catch (error) {
    console.log(error)
  }
}


const deleteProdImage =  async (req, res) => {
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

const blockProducts=async(req,res)=>{
  try {
    const prodId=req.params.id
    const product=await Product.findById(prodId)
    let newisBlocked=!product.isBlocked

    await Product.findByIdAndUpdate(prodId,{isBlocked:newisBlocked})
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
  deleteProdImage

}

// "hbs": "^4.2.0"