const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const walletSchema=new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'userSchema',
        required: true

    },
    wallet: {
        type: Number,
        default: 0
    },
    history: {
        type: Array
    }
})
const Wallet=mongoose.model('wallet',walletSchema);
module.exports={
    Wallet
}