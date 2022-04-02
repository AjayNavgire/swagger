const express = require("express");
const app = express();
const cookiesParser = require("cookie-parser")

const errorMiddleware = require("./middleware/error");

app.use(express.json())
app.use(cookiesParser())


// Route Imports
const user = require("./routes/userRoute")



app.use("/api/v1",user)


// Middleware for Errors
app.use(errorMiddleware)

module.exports = app;