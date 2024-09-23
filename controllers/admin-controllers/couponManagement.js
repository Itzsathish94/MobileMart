const Coupon=require('../../models/couponSchema')




const couponPage = async (req, res) => {
    try {
      console.log("Fetching coupons...");
      var page = 1;
      if (req.query.page) {
        page = parseInt(req.query.page);
      }
      console.log(page);
      
      let limit = 5;
      const coupons = await Coupon.aggregate([
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);
  
      const count = await Coupon.countDocuments(); 
      const totalPages = Math.ceil(count / limit);
      const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
      console.log(coupons);
      res.render('admin/coupon', { couponData:coupons, pages, currentPage: page, title: "Admin", layout: 'adminlayout' });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).send("Internal Server Error");
    }
  };
  

const addCouponPage= async(req,res)=>{
    const couponMsg = "Coupon added successfuly..!!";
    const couponExMsg = "Coupon alredy exist..!!";

    try {
        if (req.session.couponMsg) {
            res.render("admin/addCoupon",{  couponMsg ,title:"Admin",layout:'adminlayout'});
            req.session.couponMsg = false;
          } else if (req.session.couponExMsg) {
            
            res.render("admin/addCoupon", { couponExMsg ,title:"Admin",layout:'adminlayout'});
            req.session.couponExMsg = false;
          } else {
            res.render("admin/addCoupon",{ title:"Admin",layout:'adminlayout'});
          }
    } catch (error) {

        console.log(error.message);
        res.status(500).send("Internal Server Error");
        
    }
}
const addCouponPost = async (req, res) => {
  try {
      const { code, percent, expDate, maxDiscount, minPurchase } = req.body;


      console.log('Received data:', req.body);

   
      if (!code || !percent || !expDate || !maxDiscount || !minPurchase) {
          throw new Error('All fields are required');
      }

      const discount = parseFloat(percent);
      const minPurchaseAmount = parseFloat(minPurchase);
      const maxDiscountAmount = parseFloat(maxDiscount);

      if (isNaN(discount) || discount <= 0 || discount > 100) {
          throw new Error('Invalid discount value');
      }
      if (isNaN(minPurchaseAmount) || minPurchaseAmount < 0) {
          throw new Error('Invalid minimum purchase amount');
      }
      if (isNaN(maxDiscountAmount) || maxDiscountAmount < 0) {
          throw new Error('Invalid maximum discount amount');
      }

      const cpnExist = await Coupon.findOne({ code: code });

      if (!cpnExist) {
          const coupon = new Coupon({
              code: code,
              discount: discount,
              expiryDate: new Date(expDate),
              minPurchase: minPurchaseAmount,
              maxDiscount: maxDiscountAmount
          });

          await coupon.save();
          req.session.couponMsg = 'Coupon added successfully';
          res.redirect("/admin/addcoupon");
      } else {
          req.session.couponExMsg = 'Coupon already exists';
          res.redirect("/admin/addcoupon");
      }
  } catch (error) {
      console.error('Error adding coupon:', error.message);
      res.status(500).send("Internal Server Error");
  }
};



const editCouponPage = async(req, res)=>{
    try {

      const id = req.params.id;
      const couponData = await Coupon.findById(id).lean()
      console.log("edit coupon Data ", couponData)
      const formattedExpiryDate = couponData.expiryDate.toISOString().split('T')[0];
      res.render('admin/editCoupon', { layout: 'adminlayout', couponData: { ...couponData, formattedExpiryDate } });
      
    } catch (error) {
      console.error('Error fetching coupon data:', error);
    }
}


// const editCouponPost = async (req, res) => {
//   try {
//       const couponId = req.params.id
//       const { code, percent, expDate, maxDiscount, minPurchase } = req.body;


//       console.log('Received data:', req.body);

   
//       if (!code || !percent || !expDate || !maxDiscount || !minPurchase) {
//           throw new Error('All fields are required');
//       }

//       const discount = parseFloat(percent);
//       const minPurchaseAmount = parseFloat(minPurchase);
//       const maxDiscountAmount = parseFloat(maxDiscount);

//       if (isNaN(discount) || discount <= 0 || discount > 100) {
//           throw new Error('Invalid discount value');
//       }
//       if (isNaN(minPurchaseAmount) || minPurchaseAmount < 0) {
//           throw new Error('Invalid minimum purchase amount');
//       }
//       if (isNaN(maxDiscountAmount) || maxDiscountAmount < 0) {
//           throw new Error('Invalid maximum discount amount');
//       }

//       const existedCoupon = await Coupon.findOne({ code: code });

//       if(existedCoupon._id != couponId){
//           cpnExist = true
//       }

//       if (!cpnExist) {

//         await Coupon.findByIdAndUpdate(couponId, {code: code , discount: discount , expiryDate: expDate , minPurchase: minPurchase , maxDiscount : maxDiscount })
//       } else {
//           req.session.couponExMsg = 'Coupon already exists';
//           res.redirect(`/admin/edit_coupon/${couponId}`);
//       }
//   } catch (error) {
//       console.error('Error adding coupon:', error.message);
//       res.status(500).send("Internal Server Error");
//   }
// };

const updateCoupon = async (req, res) => {
  try {
    const c_id = req.params.id;
    console.log("editc copun idd" , c_id )
    // const product = await Product.findById(proId);

    const { code , percent , expDate , minPurchase , maxDiscount } = req.body;

    console.log("coupon data  " , req.body)

     // Validate input data
     if (!code || !percent || !expDate) {
      throw new Error("Missing required fields");
    }

    await Coupon.findByIdAndUpdate(
      c_id,
      {
        code: code,
        discount: percent,
        expiryDate: expDate,
        minPurchase : minPurchase ,
        maxDiscount : maxDiscount 
      },
      { new: true }
    );
   
    req.session.coupon = true;

    res.redirect("/admin/coupons");

  } catch (error) {
    console.log(error);
  }
};

  const deleteCoupon= async(req,res)=>{
    try {

        const {id}=req.body
        console.log(id,'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
        // await Coupon.findByIdAndDelete(id)
        const couponData = await Coupon.findById(id)
        const currentStatus = couponData.status
        console.log(currentStatus, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        await Coupon.findByIdAndUpdate(id , {status: !currentStatus })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");

        
    }
  }
module.exports={
    couponPage,
    addCouponPage,
    addCouponPost,
    deleteCoupon,
    editCouponPage,
    updateCoupon
}