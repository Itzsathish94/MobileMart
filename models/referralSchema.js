const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referralSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userSchema',
        required: true
    },
    referralCode: {
        type: String
    },
    redeemedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userSchema",
            required: true,
        }
    ]
})
const Referral = mongoose.model('referral', referralSchema);
module.exports = {
    Referral
}