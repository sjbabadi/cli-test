const pool = require('../db/db')
require("dotenv").config();
const express = require('express');
const router = express.Router();

// Utility functions
function mutateAllCompletedToBoolean(todos) {
  todos.forEach(mutateCompletedToBoolean);
}

function mutateCompletedToBoolean(todo) {
  if (!todo['completed'] || todo['completed'] === 'false') {
    todo['completed'] = false;
  } else {
    todo['completed'] = true;
  }
}

function extractTodoObject(requestBody) {
  const todo = {};
  todo.title = requestBody['title'] || '';
  todo.day = requestBody['day'] || '';
  todo.month = requestBody['month'] || '';
  todo.year = requestBody['year'] || '';
  todo.completed = requestBody['completed'] || false;
  todo.description = requestBody['description'] || '';

  return todo;
}

function isValidTodo(todo) {
  return todo.title.length >= 3 && (todo.day.length === 2 || todo.day === '') && (todo.month.length === 2 || todo.month === '') && (todo.year.length === 4 || todo.year === '');
}

function filterUpdatableKeys(todoObj) {
  const attributesForUpdate = Object.keys(todoObj).filter(function(key) {
    return todoObj[key] !== ''  && key !== 'id'; 
  });

  return attributesForUpdate;
}

function createUpdateQuery(todoObj) {
  const attributesForUpdate = filterUpdatableKeys(todoObj)

  const placeholders = attributesForUpdate.map(function(pairString, idx) {
    return `\$${idx+1}`
  })

  const attributesForUpdateQuery = attributesForUpdate.map(function(key, idx) {
    return `${key} = ${placeholders[idx]}`
  })

  return `UPDATE todos SET ${attributesForUpdateQuery.join(', ')} WHERE id = $${attributesForUpdateQuery.length+1} RETURNING *;`;
}

router.get('/todos',async  function(req, res, next) {
 const sql = 'SELECT * FROM TODOS';
 const { rows } = await pool.query(sql);
 
 if(!rows[0]) {
   res.json([])
 } else {
   mutateAllCompletedToBoolean(rows)
   res.json(rows)
 }
});

router.get('/todos/:id', async function(req, res, next) {
  const sql = "SELECT * FROM todos WHERE id = $1"
  const values = [req.params['id']]
  
  const { rows } = await pool.query(sql, values)
  if(rows[0]) {
    mutateCompletedToBoolean(rows[0])
    res.json(rows[0])
  } else {
    res.status(404).send('Todo could not be found')
  }
});

router.post('/todos', async function(req, res, next) {
  const todoObj = extractTodoObject(req.body);

  if(isValidTodo(todoObj)) {
    const sql = `INSERT INTO todos (title, day, month, year, completed, description) VALUES ($1, $2, $3, $4, $5, $6)`
    const values = [todoObj.title, todoObj.day, todoObj.month, todoObj.year, todoObj.completed, todoObj.description]
    const { rows } = await pool.query(sql, values)
    res.json(rows)
  } else {
    res.status(400).send('Todo cannot be saved')
  }
});

router.put('/todos/:id', async function(req, res, next) {
  const id = req.params['id'];

  //  perform get to grab the right todo
  const { rows } = await pool.query("SELECT * FROM todos WHERE id = $1", [id])
  const todo = rows[0] ? rows[0] : null

  if(todo) {
    const todoObj = Object.assign(todo, req.body)

    if(isValidTodo(todo)) {
      const updateQuerySQL = createUpdateQuery(todoObj, id)

      let values = filterUpdatableKeys(todoObj).map((key) => {
        return todoObj[key]
      })
      values = values.concat(id)
      const { rows }   = await pool.query(updateQuerySQL, values) 
      res.status(200).json(rows[0])
    } else {
      res.status(400).send('Todo cannot be updated')
    }
  } else {
    res.status(404).send('Todo not found')
  }
  });

router.delete('/todos/:id', async function(req, res, next) {
  const id = req.params['id'];

  const { rows } = await pool.query("SELECT * FROM todos WHERE id = $1", [id])
  const todo = rows[0] ? rows[0] : null

  if(todo) {
    const { rows } = await pool.query("DELETE FROM todos WHERE id = $1", [id])
    res.sendStatus(204)
  } else {
    res.status(404).send("Todo could not be found")
  }
});


        

module.exports = router;