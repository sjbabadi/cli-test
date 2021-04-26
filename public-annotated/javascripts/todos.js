class Todos {
  constructor(API) {
    this.API = API;
  }

  getTodo(id){
    return this.API.get(id);
  }

  getAllTodos() {
    return this.API.getAll();
  }

  removeTodo(id) {
    return this.API.delete(id);
  }

  updateTodo(id, data) {
    return this.API.update(id, data);
  }

  removeAllTodos() {
    return this.API.drop();
  }

  addTodo(data) {
    data = this._sanitizeDate(data);
    return this.API.create(data);
  }

  _sanitizeDate(data) {
    ['day', 'month', 'year'].forEach((prop) => {
      data[prop] = +data[prop] ? data[prop] : "";
    });

    return data;
  }

  _sortDates(a, b) { // takes in two todos, assumes they both have dates
    let aDate = new Date(+a.year, +a.month - 1, +a.day);
    let bDate = new Date(+b.year, +b.month - 1, +b.day);
    return aDate - bDate;
    // if a is less, this will be negative, and a will come first
    // if b is less, this will be positive, and b will come first
  }

  _undated(item) {
    return item.month === "" || item.year === "";
  }

  _dated(item) {
    return item.month !== "" && item.year !== "";
  }

  _complete(item) {
    return item.completed === true;
  }
  _incomplete(item) {
    return item.completed === false;
  }

  getDateString(todo) {
    return this._dated(todo) ? `${todo.month}/${todo.year.substr(2)}` : "No Due Date";
  }

  markTodoComplete(id) {
    return this.updateTodo(id, { completed: true });
  }

  markTodoIncomplete(id) {
    return this.updateTodo(id, { completed: false });
  }

  buildDateGroups(todos) {
    return todos.reduce((acc, curTodo) => {
      curTodo.due_date = this.getDateString(curTodo);
      let date = curTodo.due_date;
      acc[date] = acc[date] ? acc[date] : [];
      acc[date].push(curTodo);
      return acc;
    }, {});
  }

  getGroupedTodos() {
    return this.getAllTodos().then(todos => {
      let all = this.getSortedTodosByDate(todos);
      let completed = todos.filter(this._complete);
      let todos_by_date = this.buildDateGroups(this.getSortedTodosByDate(todos));
      let done_todos_by_date = this.buildDateGroups(this.getSortedTodosByDate(completed));
      return {all, completed, todos_by_date, done_todos_by_date};
    })
  }


  getCompletedTodos() {
    return this.getAllTodos().then(todos => todos.filter(this._completed));
  }

  getSortedTodosByDate(todos) {
    return todos.filter(this._incomplete).sort(this._sortDates).concat(todos.filter(this._complete));
  }

}