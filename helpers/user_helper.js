const nodemailer = require('nodemailer')
const argon2 = require('argon2')


///Email veification

const verifyEmail = async (email) => {

    try {
        const otp = generateOtp()
        console.log(otp)
        console.log(email)


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smpt.gmail.com',
            port: 587,
            secure: false,

            auth: {
                user: 'rhbsk1994@gmail.com',
                pass: 'avag vzbe wjee fixy'
            }
        })
        const mailoptions = {
            from: 'rhbsk1994@gmail.com',
            to: email,

            subject: 'ForVerification',
            text: `Welcome to MobileMart !!! This is your OTP:  ${otp}`
        }
        transporter.sendMail(mailoptions, (error) => {
            if (error) {
                console.log(error)
            } else {
                console.log("Email has been sent successfully")
            }
        })
        return otp



    } catch (error) {
        console.log(error)

    }
}


///generate otp

const generateOtp = () => {
    otp = `${Math.floor(1000 + Math.random() * 9000)}`
    return otp
}

///password hashing using argon2

const hashpassword = async (password) => {
    try {
        const passwordhash = await argon2.hash(password)
        return passwordhash

    } catch (error) {
        console.log(error)

    }
}


module.exports = {
    verifyEmail,
    generateOtp,
    hashpassword
}