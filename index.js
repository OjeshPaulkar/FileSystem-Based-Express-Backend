const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());

//MiddleWare to parse JSON
app.use(express.json());

//Defining the File Path
const filePath = path.join(__dirname,"todoDB.txt");

//PORT
app.listen(port, () => {
    console.log(`Server is Live on Port ${port}`);
})

//Read Todos from file
const readTodosFromFile = () => {
    try{
        const data = fs.readFileSync(filePath, "utf-8") 
        console.log(data);
        return data ? JSON.parse(data) : [];     //JSON.parse() will convert JSON to JavaScript Object
    }catch(err) {
        console.log(err);
        return [];
    }
}

//Write Todos to file
const writeTodosToFile = (todos) => {
    fs.writeFile(filePath, JSON.stringify(todos,null,2));  //JSON.stringify will convert javascript object to json
}

//This route will return all todos stored in DB.txt file
app.get("/", (req, res) => {
    const todos = readTodosFromFile();
    res.json(todos);
});


//get route using id
app.get("/:id", (req,res) => {
    const { id } = req.params;

    const todos = readTodosFromFile();
    const todo = todos.find(todo => todo.id == id);

    if (!todo) {
        return res.status(404).json({ msg: 'Todo not found' });
      } 
    res.json(todo);
})


//add new todo
app.post("/" , (req,res) => {
    const {title} = req.body;

    if(!title) {
        return res.status(404).json({msg: 'Title is Required'});
    }

    const newTodo = {id:Date.now,title,completed:false};
    const todos = readTodosFromFile();

    todos.push(newTodo);
    writeTodosToFile(todos);

    res.json(newTodo);
})


//update a todo
app.put("/:id", (req,res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todos = readTodosFromFile();
    const indexOfTodo = todos.findIndex(todo => todo.id == id);

    if (indexOfTodo === -1) {
        res.status(404).json({msg : "Todo with the give ID is not Found"});
    }

    todos[indexOfTodo].title = title || todos[indexOfTodo].title;

    if(completed !== undefined) {
        todos[indexOfTodo].completed = completed;
    }

    writeTodosToFile(todos);

    res.json(todos[indexOfTodo]);
})


//delete a todo
app.delete("/:id", (req,res) => {
    const { id } = req.params;

    const todos = readTodosFromFile();
    const indexOfTodoToDelete = todos.findIndex(todo => todo.id == id);

    if (indexOfTodoToDelete === -1) {
        res.status(404).json({msg : "Todo with the give ID is not Found"});
    }

    todos = todos.filter(todo => todo.id != id);
    writeTodosToFile(todos);

    res.json(todos);
})


//mark as completed
app.patch("/:id/complete", (req,res) => {
    const { id } = req.params;
    const { completed } = req.body;

    const todos = readTodosFromFile();
    const indexOfTodo = todos.findIndex(todo => todo.id == id);

    if (indexOfTodo === -1) {
        res.status(404).json({msg: "Todo with this ID not found"});
    }

    todos[indexOfTodo].completed = true;

    writeTodosToFile(todos);

    res.json(todos[indexOfTodo]);
})

//Error Handeling Middleware
app.use(function (err,req,res,next) {
    res.status(404).json({msg : "there was an ERROR"});
});

//Request coming from frontend which is hosted on diffrent URL CORS
app.post("/cors", (req,res) => {
    const a = req.body.a;
    const b = req.body.b;
    console.log(a*b);
    res.json({
        ans: a*b
    })
});
