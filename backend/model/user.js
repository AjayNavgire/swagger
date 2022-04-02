const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")




const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"]
    
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]    
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false
    },
    birthDate :{
        type: Date,
      required: [true, "Please Enter Your Birth Date"]
      
    },
    address : {
        type: String,
        required: [true, "Please Enter Your Address"],
        maxLength: [100, "Name cannot exceed 30 characters"]
    },
    gender : {
        type: String,
        required: [true, "Please Enter Your Gender"],
    },
    joiningDate : {
        type: Date,
        required: [true, "Please Enter Joining Date"],
    },
    salary: {
        type: String,
        required: [true, "Please Enter your salary"]
    },
    aboutYourself :{
        type: String,
        required: [true, "Please Enter Abour Yourself"],
    },
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date
   
});

userSchema.pre("save", async function (next) {

    // Hash Password    
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    
});

// JWT TOKEN
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}

// Compare Password
userSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

module.exports = mongoose.model("User", userSchema)


