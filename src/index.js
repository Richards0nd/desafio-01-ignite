const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  req.user = user;
  return next();
}

function getTodoById(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  req.todo = todo;
  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return res.status(201).json({ menssage: "User created!", user });
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
    update_at: new Date(),
  };

  user.todos.push(todo);
  return res.status(201).json({ menssage: "Todo created!", todo });
});

app.put("/todos/:id", checksExistsUserAccount, getTodoById, (req, res) => {
  const { todo } = req;
  const { title, deadline } = req.body;

  todo.title = title;
  todo.deadline = new Date(deadline);
  todo.update_at = new Date();

  return res.status(201).json({ menssage: "Todo update!", todo });
});

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  getTodoById,
  (req, res) => {
    const { todo } = req;
    todo.done = true;

    return res.status(201).json({ menssage: "Todo done!", todo });
  }
);

app.delete("/todos/:id", checksExistsUserAccount, getTodoById, (req, res) => {
  const { user, todo } = req;

  const indexTodos = user.todos.findIndex((todo) => todo.id === todo.id);
  user.todos.splice(indexTodos, 1);

  return res.status(204).json({ menssage: "Todo deleted", todo });
});

module.exports = app;
