const express = require("express");
const { registerUser, loginUser, getAllUser, getUserDetails, updateUser, deleteUser, logout, forgotPassword, resetPassword, getUserProfileDetails } = require("../controller/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").put(resetPassword)

router.route("/logout").get(logout)

router.route("/me")
.get(isAuthenticatedUser, getUserProfileDetails)

router.route("/users")
.get(isAuthenticatedUser,authorizedRoles("admin"),getAllUser)

router
.route("/user/:id")
.get(isAuthenticatedUser,authorizedRoles("admin"),getUserDetails)
.put(isAuthenticatedUser,authorizedRoles("admin"),updateUser)
.delete(isAuthenticatedUser,authorizedRoles("admin"),deleteUser)

module.exports = router;