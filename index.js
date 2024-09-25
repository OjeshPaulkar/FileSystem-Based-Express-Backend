const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const port = 3000;
const { auth, JWT_SECREAT } = require("./auth");
const { UserModel, TodoModel } = require("./db");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://ojesh:FhNlVDXRKYadsH7u@cluster0.pl8gi.mongodb.net/Todo-App-DB");

app.post("/signup", async (req,res) => {
    const { username, email, password } = req.body;
try {
    await UserModel.create({
        username,
        email,
        password
    })
    res.json({
        msg : "You are Sucessfully Signed Up"
    })
} catch (error) {
   return res.json({msg : error.message})
}
})

app.post("/signin",async (req,res) => {
    const { name, email, password } = req.body;
    try {
        const responce = await UserModel.findOne({
            email : email,
            password: password
        })
        if(responce) {
            const token = jwt.sign({
                id: responce._id.toString()
            },JWT_SECREAT);
            res.json({token : token})
        }
    } catch (error) {
        res.status(403).json({msg : "Invalid Credentials"});
    } 
})

app.get("/todos", auth, async (req,res) => {
    const { userId }  = req;
try {
    const todos = await TodoModel.find({
        userId
    })
    res.json({
        todos
    })
} catch (error) {
    res.status(403).json({msg : error.message})
}
   
})

app.post("/todo", auth,async (req,res) => {
    const { description, status} = req.body;
try {
    await  TodoModel.create({
        description,
        status,
        userId: req.userId
    })
    res.json({msg : "Todo Created Sucessfully"})
} catch (error) {
    res.status(403).json({msg: error.message})
}
})

app.listen(port, () => {
    console.log(`App is Live on Port ${port}`);
})