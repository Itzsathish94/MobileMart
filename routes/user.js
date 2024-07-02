var express = require('express');

const { logedout, logedin, isBlocked } = require('../middleware/usersAuth')

const { resendOtp, gethome, showloginpage, dologin, getotppage, dosignup, showsigninpage, submitotp, getproducts, doLogout, aboutpage } = require('../controllers/user-controllers/userloginmanagement')
const { submitMail, submitMailPost, forgotOtppage, forgotOtpSubmit, resetPasswordPage, resetPassword } = require('../controllers/user-controllers/forgotPassword')
// const {
//     viewUserProfile,
//     EditUserProfile,
//     updateUserProfile,
//     manageAddress,
//     addAddress,
//     addAddressPost,
//     editAddress,
//     editAddressPost,
//     deleteAddress,
//     myorders,
//     orderDetails
// } = require('../controllers/user-controllers/profile')

// const { loadCartPage ,addToCart ,removeFromCart ,updateCart } = require('../controllers/user-controllers/cart')

// const { loadCheckoutPage ,placeorder ,orderSuccess} = require('../controllers/user-controllers/checkoutManagement')

// const { showWishlistPage, addToWishList ,removeFromWishList } = require('../controllers/user-controllers/wishlistManagement')

// const { shopPage, loadLowToHigh, loadHighToLow, loadZtoA, loadAtoZ, filterByCategory ,} = require('../controllers/user-controllers/shopManagement')

var router = express.Router();
const Upload=require("../multer/user_multer")

/* GET home page. */
router.get('/', gethome);
// router.get('/', logedin , gethome);

// router.get('/productDetails',logedin,(req,res)=>{
//   res.render('/productDetails')

// })
router.get('/productDetails/:id', logedin, isBlocked, getproducts)

///login and logout

router.get('/login', logedout, showloginpage)
router.post('/login', dologin)
router.get('/logout', doLogout)

router.get('/signup', logedout, showsigninpage)
router.post('/signup', logedout, dosignup)

router.get('/submit_otp', logedout, getotppage)
router.post('/submit_otp', logedout, submitotp)
router.get('/resend_otp', logedout, resendOtp)
router.get('/forgotPassword', logedout, submitMail)
router.post('/forgotPassword', logedout, submitMailPost)
router.get('/otp', logedout, forgotOtppage)
router.post('/otp', forgotOtpSubmit)
router.get('/resetPassword', logedout, resetPasswordPage)
router.post('/resetPassword', resetPassword)


/////////profile
// router.get('/profile',logedin,viewUserProfile)
// router.get('/profile',logedin ,isBlocked ,viewUserProfile)
// router.get('/edit_profile',logedin ,isBlocked ,EditUserProfile)
// router.post('/edit_profile/:id',logedin,isBlocked, Upload.single('image')  ,updateUserProfile)


///adress
// router.get('/addresses', logedin,isBlocked, manageAddress)
// router.get('/add_address',logedin,isBlocked, addAddress)
// router.post('/add_address',logedin,isBlocked, addAddressPost)
// router.get('/edit_address/:id',logedin,isBlocked, editAddress)
// router.post('/edit_address/:id', editAddressPost)
// router.get('/delete_address/:id',deleteAddress)


// /////order
// router.post('/placeorder',placeorder)
// router.get('/orderPlaced',logedin,isBlocked,orderSuccess)
// router.get('/orderDetails/:id',logedin,isBlocked,orderDetails)

// ////userOrder related
// router.get('/myorders',logedin,isBlocked,myorders)

// /////cart
// router.get('/cart',logedin,isBlocked, loadCartPage)
// router.post('/addtocart/:id',addToCart)
// router.post('/removeFromCart',logedin,isBlocked,removeFromCart)

// router.post('/updatecart',updateCart)


// //// checkout
// router.get('/cart/checkout',logedin,isBlocked, loadCheckoutPage)


// //// wishlist

// router.get('/wishlist',logedin,isBlocked, showWishlistPage)
// router.post('/addtowishlist',logedin,isBlocked, addToWishList)
// router.post('/removeFromWishList',logedin,isBlocked,removeFromWishList)


// /////// shop
// router.get('/shop',logedin,isBlocked, shopPage)
// router.get('/shop_lowToHigh',logedin,isBlocked, loadLowToHigh)
// router.get('/shop_highToLow',logedin,isBlocked, loadHighToLow),
// router.get('/shop_loadAtoZ',logedin,isBlocked, loadAtoZ)
// router.get('/shop_loadZtoA',logedin,isBlocked, loadZtoA)
// router.get('/filterByCategory/:id',logedin,isBlocked, filterByCategory)
// router.get('/category_fil', logedin , isBlocked,  catFilter )
// router.post('/sort_product_az', logedin , isBlocked, sortProduct_az)
// router.post('/sort_product_price', logedin , isBlocked, sortProductByPrice)

/////////// other pages
// router.get('/about', aboutpage)



module.exports = router;
