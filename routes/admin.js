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
const { couponPage, addCouponPage , addCouponPost , deleteCoupon}=require('../controllers/admin-controllers/couponManagement')
const {  getSales,loadDashboard,
    getChartData,generateSalesReportPDF}=require('../controllers/admin-controllers/dashBoards')

const { deleteBrand,
    updateBrand,
    addNewBrand,
    addBrandPage,
    editBrandPage,

    loadBrands} = require('../controllers/admin-controllers/brands')

// router.get('/',isLogin ,adminlogin)
router.get('/', isLogin, loadDashboard)

///admin login routing
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

////////////Block User
router.get('/users',isLogin  ,usersPage)
router.put('/blockuser',blockUser)

////orders
router.get('/orders', isLogin, ordersPage)
router.get('/order_details/:id', isLogin, orderDetails)
router.post('/change_status/:id',isLogin, changeStatus)

/// coupon
router.get('/coupons',isLogin,couponPage)
router.get('/addcoupon',isLogin,addCouponPage)
router.post('/add_coupon',isLogin, addCouponPost)
router.delete('/delete_coupon',isLogin,deleteCoupon)

// ///chart
router.get('/get_sales',isLogin, getSales)
router.get('/get_chart_data',isLogin, getChartData)

//brand
router.get('/brands' , loadBrands)
router.get('/add_brands', isLogin, addBrandPage)
router.post('/add_brands', isLogin, Upload.single('image'), addNewBrand)
router.post('/delete_brands', isLogin, deleteBrand)
router.get('/edit_brands/:id', isLogin, editBrandPage)
router.post('/update_brands/:id', isLogin, Upload.single('image'), updateBrand)

module.exports = router;
