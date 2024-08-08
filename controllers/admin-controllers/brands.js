const { Product } = require('../../models/productsSchema') 
const { Brand } = require('../../models/brands');
const mongoose = require('mongoose')
const ObjectId = require('mongoose')


const loadBrands = async (req, res) => {
    try {
      const brandData = await Product.aggregate([
        { $match: { isBlocked: false } }, // Changed from is_blocked to isBlocked
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brandDetails'
          }
        },
        { $unwind: '$brandDetails' },
        {
          $group: {
            _id: '$brandDetails._id',
            brandName: { $first: '$brandDetails.brand' },
            brandImageUrl: { $first: '$brandDetails.imageUrl' },
            isListed: { $first: '$brandDetails.isListed' },
            productCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            brandId: '$_id',
            brandName: 1,
            brandImageUrl: 1,
            productCount: 1,
            isListed: 1
          }
        }
      ]);
  
      console.log(brandData);
  
      res.render('admin/brands', { brandData, layout: 'adminlayout' });
  
    } catch (error) {
      console.error(error); // Add error handling
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  
  
  
  
  
  /// To get add brand page ///
  
  const addBrandPage = (req, res) => {
    try {
      const brandExistMsg = "Brand already exists..!!";
  
      if (req.session.brandSave) {
        res.render("admin/add_brand", { brandSaveMsg: "Brand saved successfully!", layout: 'adminlayout' });
        req.session.brandSave = false; // Reset the session flag
      } else if (req.session.brandExist) {
        res.render("admin/add_brand", { brandExistMsg, layout: 'adminlayout' });
        req.session.brandExist = false; // Reset the session flag
      } else {
        res.render("admin/add_brand", { layout: 'adminlayout' });
      }
    } catch (error) {
      console.error(error); // Improved error logging
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  
  
  
  /// To add new brand post///
  const addNewBrand = async (req, res) => {
    const brandName = req.body.name;
    const image = req.file;
  
    try {
      const brandExist = await Brand.findOne({
        brand: { $regex: new RegExp(`^${brandName}$`, "i") },
      });
  
      if (!brandExist) {
        const brand = new Brand({
          brand: brandName,
          imageUrl: image.filename,
        });
  
        await brand.save();
        req.session.brandSave = true;
      } else {
        req.session.brandExist = true;
      }
  
      res.redirect("/admin/add_brands");
    } catch (error) {
      console.error(error); // Improved error logging
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  
  
  /// To edit brand ///
  
  const editBrandPage = async (req, res) => {
    const brandId = req.params.id;
  
    try {
      const brandData = await Brand.findById(brandId).lean(); // Simplified the findById method
      const brandExistMsg = "Brand already exists..!!";
      console.log(brandData);
  
      if (req.session.brandExist) {
        res.render("admin/edit_brand", {
          brandData,
          brandExistMsg,
          layout: 'adminlayout',
        });
        req.session.brandExist = false; // Reset the session flag
      } else {
        res.render("admin/edit_brand", {
          brandData,
          layout: 'adminlayout',
        });
      }
    } catch (error) {
      console.error(error); // Improved error logging
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  
  
  const updateBrand = async (req, res) => {
    try {
      const brandName = req.body.name;
      const image = req.file;
      const brandId = req.params.id;
  
      const brand = await Brand.findById(brandId);
      if (!brand) {
        req.session.brandNotFound = true;
        return res.redirect("/admin/brands");
      }
  
      const updImg = image ? image.filename : brand.imageUrl;
  
      const brandExist = await Brand.findOne({
        brand: { $regex: new RegExp(`^${brandName}$`, "i") },
        _id: { $ne: brandId },
      });
  
      if (!brandExist) {
        await Brand.findByIdAndUpdate(
          brandId,
          {
            brand: brandName,
            imageUrl: updImg,
          },
          { new: true }
        );
  
        req.session.brandUpdate = true;
        res.redirect("/admin/brands");
      } else {
        req.session.brandExist = true;
        res.redirect("/admin/brands");
      }
    } catch (error) {
      console.error(error); // Improved error logging
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  
  
  const deleteBrand = async (req, res) => {
    try {
      const { id } = req.body;
  
      const brand = await Brand.findById(id);
      if (!brand) {
        console.error(`Brand with ID ${id} not found.`);
        return res.status(404).send('Brand not found');
      }
  
      const newListed = !brand.isListed;
  
      await Brand.findByIdAndUpdate(id, { isListed: newListed }, { new: true });
  
      res.redirect('/admin/brands');
    } catch (error) {
      console.error(error); // Improved error logging
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  };
  

  module.exports = {
    deleteBrand,
    updateBrand,
    addNewBrand,
    addBrandPage,
    loadBrands,
    editBrandPage

  }