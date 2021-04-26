class App {
  constructor() {
    this.API = new API('/api/todos', '/api/reset');
    this.todos = new Todos(this.API);
    this.view = new View();
    this.controller = new Controller(this.todos, this.view);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
})