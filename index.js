const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const port = 3000;
const { auth, JWT_SECREAT } = require("./auth");
const { UserModel, TodoModel } = require("./db");

const app = express();
app.use(express.json());

mongoose.connect("");


app.post("/signup", async (req,res) => {   
try {
        const mySchema = z.object({
            username: z.string().min(5).max(12),
            email: z.string().email(),
            password: z.string().min(7).max(12)
                        .refine((password) => /[A-Z]/.test(password), {
                            message: "Password must consist of atleast one Upper case Character",
                        })
                        .refine((password) => /[a-z]/.test(password), {
                            message: "Password must consist of atleat one lowercase Charater",
                        })
                        .refine((password) => /[!@#$%^&*()+-]/.test(password), {
                            message: "Password must consist of atleast one Special Character",
                        })
        });
        const verifiedData = mySchema.safeParse(req.body);
        if(!verifiedData.success) {
            return res.status(403).json({message: verifiedData.error.issues});
        }
        const { username, email, password } = req.body;
       const hashedPassword = await bcrypt.hash(password, 5);

        await UserModel.create({
            username,
            email,
            password: hashedPassword
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
        const user = await UserModel.findOne({
            email : email,
        })

        if(!user) {
            return res.status(403).json({msg: "Invalid Credentials - Email does not exists"});
        }

        const verifiedPassword = await bcrypt.compare(password, user.password);

        if(!verifiedPassword) {
           return res.status(403).json({msg : "Invalid Credentials - Password is Incorrect"})
        }
        const token = jwt.sign({
            id: user._id.toString()
        },JWT_SECREAT);
        res.json({token : token })
    } catch (error) {
        res.status(500).json({msg : "Server Error"});
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


app.put("/updateTodo", auth, async (req,res) => {
    try {
        const todoId = req.body._id;
        const todoStatus = req.body.status;
        const { description } = req.body;
        const userId = req.userId;
        console.log(userId)
    
        const todo = await TodoModel.findOne({
            _id: todoId,
        })
    
        if(!todo) {
           return res.status(403).json({message: "Incorrect Todo ID"})
        }
        const dbUserId = todo.userId.toString();
        console.log(dbUserId);

        if (userId===dbUserId) {
            todo.description = description;
            todo.status = todoStatus;

            await todo.save();
            return res.status(200).json({message: "Todo Updated Sucessfully"});
        }else{
            return res.status(403).json({message : "Invalid user, Cannot update Todo"});
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    } 
})