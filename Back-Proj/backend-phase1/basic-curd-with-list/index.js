const express = require('express');

const app = express();
const userRouter = require("./user");

app.use(express.json());
app.use(express.urlencoded());

app.use("/users", userRouter)

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server is Up and running at port : ${PORT}`);
})