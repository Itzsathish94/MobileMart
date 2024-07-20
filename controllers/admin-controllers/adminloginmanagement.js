/////////////////////////////////////////

const adminEmail="admin@gmail.com"
const adminPassword ="admin@123"



///////////////////////////////////


const adminlogin = async (req, res) => {
    try {
      res.render('admin/adminlogin', {  layout:'loginlayout'})
  
    } catch (error) {
        console.log(error)
  
    }
  }

const doAdminLogin=async (req,res)=>{
    try {
        const {email,password}=req.body
        if(email==adminEmail && password==adminPassword){
            req.session.admin = req.body
            res.redirect('/admin/products')
        }else{
            res.redirect('/admin/adminlogin')
        }

    } catch (error) {
        console.log(error)
        
    }
}
const doLogout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin/adminlogin')
        
    } catch (error) {
        console.log(error)
    }
}
module.exports={
    adminlogin,
    doAdminLogin,
    doLogout
}