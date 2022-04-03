const ErrorHandler = require("../utils/errorhandler")
const catchAsyncError = require("../middleware/catchAsyncError")
const User = require("../model/user");
const sendToken = require("../utils/jwtToken");
const ApiFeatures = require("../utils/apiFeatures");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")

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

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    // Get Reset Password Token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, 
    please ignore it`;

    try {

        await sendEmail({
            email: user.email,
            subject: `Swagger Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})

// Forgot Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {


    // Creating Token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 404))
    }

    user.password = req.body.password ;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    sendToken(user, 200, res)
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

// Get User Profile Details
exports.getUserProfileDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id);

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



