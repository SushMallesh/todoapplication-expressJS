const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API to get list of Todos
app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  const getQuery = `
  SELECT * FROM todo 
  WHERE status LIKE '%${status}%' 
  AND priority LIKE '%${priority}%'
  AND todo LIKE '%${search_q}%';`;
  const todoList = await database.all(getQuery);
  response.send(todoList);
});

// API to get a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo 
    WHERE id = ${todoId};`;
  const todoList = await database.get(getTodoQuery);
  response.send(todoList);
});

//API to create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const getCreateQuery = `
    INSERT INTO todo (id,todo,status,priority)
    VALUES(${id},
            '${todo}',
            '${status}',
            '${priority}');`;
  await database.run(getCreateQuery);
  response.send("Todo Successfully Added");
});

// API to Deletes a todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDeleteQuery = `
    DELETE FROM todo WHERE id = ${todoId};`;
  await database.run(getDeleteQuery);
  response.send("Todo Deleted");
});

//API to Update the details of a specific todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  let getUpdateQuery;
  if (status !== "") {
    getUpdateQuery = `
    UPDATE todo 
    SET status = '${status}'
    WHERE id = "${todoId}";`;
    await database.run(getUpdateQuery);
    response.send("Status Updated");
  } else if (priority !== "") {
    getUpdateQuery = `
    UPDATE todo 
    SET priority = '${priority}'
    WHERE id = "${todoId}";`;
    await database.run(getUpdateQuery);
    response.send("Priority Updated");
  } else if (todo !== "") {
    getUpdateQuery = `
    UPDATE todo 
    SET todo = '${todo}'
    WHERE id = "${todoId}";`;
    await database.run(getUpdateQuery);
    response.send("Todo Updated");
  }
});

module.exports = app;
