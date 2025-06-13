const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    phoneCode: {
        type: String,
        minlength: 6,
    },
    phone: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    active:{
         type: Boolean,
         default:true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model("user", UserSchema);
