const express = require("express");
const { registerUser, loginUser, getAllUser, getUserDetails, updateUser, deleteUser, logout } = require("../controller/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout)

router.route("/users")
.get(isAuthenticatedUser,authorizedRoles("admin"),getAllUser)

router
.route("/user/:id")
.get(isAuthenticatedUser,authorizedRoles("admin"),getUserDetails)
.put(isAuthenticatedUser,authorizedRoles("admin"),updateUser)
.delete(isAuthenticatedUser,authorizedRoles("admin"),deleteUser)

module.exports = router;