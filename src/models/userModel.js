// create a schema
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    country :{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    role: {
        type: Number,
        default: 0
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationToken:{
        type: String
    },
    otp:{
        type:Number,
        default:null
    },
}, {
    timestamps: true
});

export default mongoose.model('user', userSchema)