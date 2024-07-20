const { User } = require('../../models/userSchema')
const { Category } = require('../../models/categorySchema')
const { Product } = require('../../models/productsSchema')
const userHelper = require('../../helpers/user_helper')
const argon2 = require('argon2')
const mongoose = require('mongoose')
const ObjectId=mongoose.Types.ObjectId
const Cart=require('../../models/cart')

let otp
let userotp
let usermail
let hashedPassword
let userRegestData
let userData


const gethome = async (req, res) => {
    try {
        userData = req.session.user
        let id
        if (userData) { id = userData._id }
        else { id = 0 }
        const catagories = await Category.find({ isListed: true }).lean()
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
            }
        ])
          console.log(products)
        res.render('user/index', { products, catagories, userData, layout: 'layout' })


    } catch (error) {
        console.log(error)
    }
}


const showloginpage = async (req, res) => {
    let regSuccessMsg = 'User registered sucessfully..!!'
    let blockMsg = 'Sorry something went wrong..!!'
    let mailErr = 'Incorrect email or password..!!'
    let newpasMsg = 'Your password reseted successfuly..!!'
    message2 = false
    try {
        if (req.session.mailErr) {
            res.render('user/login', { mailErr })
            req.session.mailErr = false
        }
        else if (req.session.regSuccessMsg) {
            res.render('user/login', { regSuccessMsg })
            req.session.regSuccessMsg = false
        }
        else if (req.session.userBlocked) {
            res.render('user/login', { blockMsg })
            req.session.userBlocked = false
        }
        else if (req.session.LoggedIn) {
            res.render('user/login')
            req.session.LoggedIn = false
        }
        else if (req.session.newPas) {
            res.render('user/login', { newpasMsg })
            req.session.newPas = false
        }
        else {
            res.render('user/login')
        }

    } catch (error) {
        console.log(error)
    }
}

/////login submition
const dologin = async (req, res) => {
    try {

        const Email = req.body.email;
        const Password = req.body.password;

        userData = await User.findOne({ email: Email });

        if (userData) {
            if (await argon2.verify(userData.password, Password)) {

                const isBlocked = userData.isBlocked

                if (!isBlocked) {

                    req.session.LoggedIn = true
                    req.session.user = userData

                    res.redirect('/')
                    const dologin = async (req, res) => {
                        try {

                            const Email = req.body.email;
                            const Password = req.body.password;

                            userData = await User.findOne({ email: Email });

                            if (userData) {
                                if (await argon2.verify(userData.password, Password)) {

                                    const isBlocked = userData.isBlocked

                                    if (!isBlocked) {

                                        req.session.LoggedIn = true
                                        req.session.user = userData

                                        res.redirect('/')
                                        const Toast = Swal.mixin({
                                            toast: true,
                                            position: "top-end",
                                            showConfirmButton: false,
                                            timer: 3000,
                                            timerProgressBar: true,
                                            didOpen: (toast) => {
                                                toast.onmouseenter = Swal.stopTimer;
                                                toast.onmouseleave = Swal.resumeTimer;
                                            }
                                        });
                                        Toast.fire({
                                            icon: "success",
                                            title: "Signed in successfully"
                                        });

                                    } else {
                                        userData = null
                                        req.session.userBlocked = true
                                        res.redirect('/login')
                                    }
                                }
                                else {
                                    req.session.mailErr = true
                                    res.redirect('/login')
                                }
                            } else {
                                req.session.mailErr = true
                                res.redirect('/login')
                            }

                        } catch (error) {
                            console.log(error)
                        }
                    }
                } else {
                    userData = null
                    req.session.userBlocked = true
                    res.redirect('/login')
                }
            }
            else {
                req.session.mailErr = true
                res.redirect('/login')
            }
        } else {
            req.session.mailErr = true
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error)
    }
}

//logout 
const doLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout error");
                res.redirect("/");
            }
            console.log("Logged out successfully");
            res.redirect("/login");
        })
        userData = null
    } catch (error) {
        console.log(error.message);
    }
}
///render signup page
const showsigninpage = async (req, res) => {
    try {
        res.render('user/signup')
    } catch (err) {
        console.log(err)
    }
}
///user signup

const dosignup = async (req, res) => {
    try {
        
        hashedPassword = await userHelper.hashpassword(req.body.password)
        usermail = req.body.email
        userRegestData = req.body

        const userExist = await User.findOne({ email: usermail }).lean()
        if (!userExist) {
            otp = await userHelper.verifyEmail(usermail)
            res.redirect('/submit_otp')
        } else {
            res.render('user/login', {msg: "User already Exists"})
        }

    } catch (error) {
        console.log(error)

    }
}
////////get otp page
const getotppage = async (req, res) => {
    try {
        res.render('user/sotp')
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

//verify otp and add user data to DB
const submitotp = async (req, res) => {
    userotp = req.body.otp
    console.log(userotp)

    if (userotp == otp) {
        const user = new User({
            name: userRegestData.name,
            email: userRegestData.email,
            mobile: userRegestData.phone,
            password: hashedPassword,
            isBlocked: false
        })
        await user.save()
        req.session.regSuccessMsg = true
        
        res.redirect('/login')
    } else {
        res.redirect('/submit_otp')
        //res.json({ status: false })
    }

}
const resendOtp = async (req, res) => {
    try {
        otp = await userHelper.verifyEmail(usermail)
        res.redirect('/submit_otp')

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}




////detailed product view
const getproducts = async (req, res) => {
   
    try {
        userData=req.session.user
        console.log(userData)
        const item = new ObjectId(req.params.id)
        console.log(item)
        let ProductExistInCart
       
        
        const product = await Product.findById(item).lean()
        let outOfStock = true;

        if(product.stock){
            outOfStock = false
        }
        const ProductExist = await Cart.find({
            userId: userData._id,
            product_Id: item
        })
        console.log(ProductExist)
        if (ProductExist.length === 0) {
            ProductExistInCart = false
        } else {
            ProductExistInCart = true
        }

        console.log(product , "productttttttttttt")
        const catId = new ObjectId(product.category)
        const relatedProducts = await Product.aggregate([
            {
                $match: {
                    
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
                $limit:4
            }
        ])

        console.log(relatedProducts, "RELATED PRODUCTSSSSSS")

         res.render('user/productDetails', { product ,ProductExistInCart, relatedProducts , outOfStock , userData, layout: 'layout' })

    } catch (error) {
        console.log(error)

    }
}

const googleCallback = async (req, res) => {
    try {
        // Add the user's name to the database
        userData = await User.findOneAndUpdate(
            { email: req.user.email },
            { $set: { name: req.user.displayName, isVerified: true} },
            { upsert: true, new: true }
        );
        console.log(userData)

        // Set the user session
        req.session.LoggedIn = true
        req.session.user = userData
        // Redirect to the homepage
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
}

///////////////////////other pages

const aboutpage = async (req, res) => {
    try {
        res.render('user/about')

    } catch (error) {
        console.log(error)

    }
}

module.exports = {
    showloginpage,
    showsigninpage,
    getotppage,
    dosignup,
    submitotp,
    resendOtp,

    dologin,
    doLogout,
    gethome,
    getproducts,
    googleCallback,

    //////// other pages //////
    aboutpage

}

