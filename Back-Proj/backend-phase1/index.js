const express = require('express');

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World")
})

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server is Up and running at port : ${PORT}`);
})