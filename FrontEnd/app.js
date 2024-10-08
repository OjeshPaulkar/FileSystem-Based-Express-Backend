document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signup-btn");
    const signinBtn = document.getElementById("signin-btn");
    const addTodoBtn = document.getElementById("add-todo-btn");

    // API URL
    const apiUrl = "http://localhost:3000";

    // Handle Signup
    signupBtn.addEventListener("click", async () => {
        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        const res = await fetch(`${apiUrl}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();
        alert(data.msg);
    });

    // Handle Signin
    signinBtn.addEventListener("click", async () => {
        const email = document.getElementById("signin-email").value;
        const password = document.getElementById("signin-password").value;

        const res = await fetch(`${apiUrl}/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Signed in successfully!");
            document.getElementById("signin-section").style.display = "none";
            document.getElementById("todo-section").style.display = "block";
            fetchTodos();
        } else {
            alert(data.msg);
        }
    });

    // Fetch Todos
    async function fetchTodos() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${apiUrl}/todos`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        const todoList = document.getElementById("todo-list");
        todoList.innerHTML = "";
        data.todos.forEach((todo) => {
            const li = document.createElement("li");
            li.innerHTML = `${todo.description} - ${todo.status} 
                <button class="update-btn" data-id="${todo._id}">Update</button>`;
            todoList.appendChild(li);
        });
    }

    // Add Todo
    addTodoBtn.addEventListener("click", async () => {
        const description = document.getElementById("todo-description").value;
        const token = localStorage.getItem("token");

        const res = await fetch(`${apiUrl}/todo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ description, status: "Pending" }),
        });

        const data = await res.json();
        alert(data.msg);
        fetchTodos();
    });
});
