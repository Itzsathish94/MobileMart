const mongoose = require("mongoose");
const { isCancelled } = require("../helpers/hbsHelper");
const Schema=mongoose.Schema

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  product: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      image: { type: String },
      isCancelled:{type:Boolean , default:false},
      isReturned:{type:Boolean , default:false}
     
    },
  ],

  address: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  discountAmt: {
    type: Number,
  },

  amountAfterDscnt: {
    type: Number,
  
  },

  coupon: {
    type: String,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  couponUsed: {
    type: Boolean,
    default: false,
  },
  // coupon: [
  //   {
  //     name: {
  //       type: String,
  //     },
  //     offer: {
  //       type: Number,
  //     },
  //   },
  // ],

  status: {
    type: String,
    enum: ["pending", "Shipped", "Delivered", 'Cancelled', 'Returned'],
    default: "pending",
  },

  returnMsg:{
    type: String
  },
  
  date: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
