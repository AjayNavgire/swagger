const ErrorHandler = require("../utils/errorhandler")
const catchAsyncError = require("../middleware/catchAsyncError")
const User = require("../model/user");
const sendToken = require("../utils/jwtToken");
const ApiFeatures = require("../utils/apiFeatures");

// Register User
exports.registerUser = catchAsyncError( async(req, res, next)=>{
   const {name, email, password, birthDate, address, gender, joiningDate, salary, aboutYourself, } = req.body;

    const user = await User.create({name, email, password, birthDate, address, gender, joiningDate, salary, aboutYourself,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl"
        }
    });

   sendToken(user, 201, res)
})

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    console.log({email, password})

    // Checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    sendToken(user,200, res)
})

// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

// Get All User
exports.getAllUser = catchAsyncError(async (req, res) => {

    const resultPerPage = 5;
    const userCount = await User.countDocuments()


    const apiFeature = new ApiFeatures(User.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    const user = await apiFeature.query

    res.status(200).json({
        success: true,
        user,
        userCount
        
    })
})

// Get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    res.status(200).json({
        success: true,
        user
    })
} )

// Update User -- Admin
exports.updateUser = catchAsyncError(async (req, res) => {

    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        renValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Delete User

exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    })
})



