const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/api/auth", authRoutes)

app.listen(5001, () => {
    console.log('Server is up and running...');
})