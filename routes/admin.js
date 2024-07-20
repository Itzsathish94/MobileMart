var express = require('express');
var router = express.Router();
const Upload=require("../multer/product_control")

//importing module functions from controllers
const {showproductslist,addproduct_page,addproduct,editProduct,deleteproduct,showeditprodpage,fullDeleteProd,deleteProdImage ,blockProducts}=require('../controllers/admin-controllers/product-management')
const {unListCategory ,categoryPage,showEditCategory,addcategory,editCategory,addcategory_page,deleteCategory}=require('../controllers/admin-controllers/category-management')
const {usersPage,blockUser}=require('../controllers/admin-controllers/user-management');
const { isLogin, isLogout } = require('../middleware/adminAuth');
const { adminlogin, doAdminLogin,doLogout}=require('../controllers/admin-controllers/adminloginmanagement')
const { ordersPage, orderDetails, changeStatus } = require('../controllers/admin-controllers/ordersManagement')

router.get('/',isLogin ,adminlogin)


///padmin login routing
router.get('/adminlogin' ,isLogout,adminlogin)
router.post('/adminlogin' ,doAdminLogin)
router.get('/logout',doLogout)

///products management routing
router.get('/products' ,isLogin ,showproductslist)
router.get('/addProduct' ,isLogin ,addproduct_page)
router.post('/addProduct', isLogin  ,     Upload.array('image',5),addproduct)

router.get('/edit_product/:id', isLogin  ,Upload.array('image',5),showeditprodpage)
router.post("/update_product/:id", isLogin  ,Upload.array('image',5),editProduct)

router.put('/block_product', isLogin  ,deleteproduct)
router.put('/delete_product', isLogin  ,fullDeleteProd)
router.put('/blockProduct',blockProducts)

router.delete('/product_img_delete', isLogin  , deleteProdImage)


/////category management routing
router.get('/category'  ,isLogin,categoryPage)
router.get('/editCategory/:id',isLogin  ,showEditCategory)
router.post('/editCategory/:id',isLogin  ,Upload.single('image'),editCategory)
router.post('/unlistCategory',isLogin,unListCategory)

router.get('/addCategory',isLogin  ,addcategory_page)
router.post('/addCategory' ,isLogin ,Upload.single('image'),addcategory)

router.post('/delete_category', isLogin  ,deleteCategory)
////////////

router.get('/users',isLogin  ,usersPage)
router.put('/blockuser',blockUser)

////orders
router.get('/orders', isLogin, ordersPage)
router.get('/order_details/:id', isLogin, orderDetails)
router.post('/change_status/:id',isLogin, changeStatus)

module.exports = router;
