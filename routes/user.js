var express = require('express');
require('../middleware/googleAuth')
const passport = require('passport');

const {loadProfile } = require('../controllers/user-controllers/profile')

const { logedout, logedin, isBlocked } = require('../middleware/usersAuth')

const { resendOtp, gethome, showloginpage, dologin, getotppage, dosignup, showsigninpage, submitotp, getproducts, doLogout, aboutpage,googleCallback } = require('../controllers/user-controllers/userloginmanagement')
const { submitMail, submitMailPost, forgotOtppage, forgotOtpSubmit, resetPasswordPage, resetPassword } = require('../controllers/user-controllers/forgotPassword')

const { shopPage,searchAndSort } = require('../controllers/user-controllers/shopManagement')
const {
    viewUserProfile,
    EditUserProfile,
    updateUserProfile,
    manageAddress,
    addAddress,
    addAddressPost,
    editAddress,
    editAddressPost,
    deleteAddress,
    myorders,
    orderDetails,
    changepassword,
    changepass,
    cancelorder,
} = require('../controllers/user-controllers/profile.js')
const { cancelOrder,returnOrder, cancelOneProduct , returnOneProduct,getInvoice}= require('../controllers/user-controllers/ordercontroller')


const { loadCartPage, addToCart, removeFromCart, updateCart } = require('../controllers/user-controllers/cart')

const { loadCheckoutPage, placeorder, orderSuccess ,} = require('../controllers/user-controllers/checkoutManagement')
var router = express.Router();
const Upload=require("../multer/user_multer")
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback)


/* GET home page. */
router.get('/',  gethome);

router.get('/productDetails/:id',   getproducts)

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
router.get('/profile', logedin, isBlocked, viewUserProfile)
router.get('/edit_profile', logedin, isBlocked, EditUserProfile)
router.post('/edit_profile/:id', logedin, isBlocked, Upload.single('image'), updateUserProfile)


///address
router.get('/addresses', logedin, isBlocked, manageAddress)
router.get('/add_address', logedin, isBlocked, addAddress)
router.post('/add_address', logedin, isBlocked, addAddressPost)
router.get('/edit_address/:id', logedin, isBlocked, editAddress)
router.post('/edit_address/:id',  logedin, isBlocked,editAddressPost)
router.get('/delete_address/:id', logedin, isBlocked, deleteAddress)

///change password
router.get('/changepassword', logedin, isBlocked, changepassword)
router.post('/changepass', logedin, isBlocked, changepass)


/////order
router.post('/placeorder', placeorder)
router.get('/orderPlaced', logedin, isBlocked, orderSuccess)
router.get('/orderDetails/:id', logedin, isBlocked, orderDetails)
router.post('/cancelorder/:id', cancelorder)

//Invoice
router.get('/get_invoice', logedin, isBlocked, getInvoice)

////userOrder related
router.get('/myorders', logedin, isBlocked, myorders)

/////cart
router.get('/cart', logedin, isBlocked, loadCartPage)
router.post('/addtocart/:id', logedin, isBlocked, addToCart)
router.post('/removeFromCart', logedin, isBlocked, removeFromCart)
router.post('/updatecart', updateCart)


//// checkout
router.get('/cart/checkout', logedin, isBlocked, loadCheckoutPage)


// /////// shop
 router.get('/shop',shopPage)
 router.post('/search',searchAndSort)
 router.put('/cancel-order/:id', cancelOrder);
 router.put('/return-order/:id', returnOrder);
 router.put('/cancel-one-product', cancelOneProduct);
 router.put('/return-one-product', returnOneProduct);
 router.post('/cancelOneProduct', cancelOneProduct)

module.exports = router;
