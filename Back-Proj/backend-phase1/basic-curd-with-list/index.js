const express = require('express');
require("dotenv").config()
const app = express();
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const logger = require("./middlewares/logger");
const mongoose = require("mongoose");
const e = require('express');
const errorHandler = require("./middlewares/errorHandler");
app.use(logger);
app.use(express.json());
app.use(express.urlencoded());

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use(errorHandler);
const PORT = process.env.PORT || 5001;



mongoose.connect(process.env.DB_CONNECTION)
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is Up and running at port : ${PORT}`);
    })
})
.catch((err) => {
    console.log("Failed to connect to MongoDB: ", err);
})