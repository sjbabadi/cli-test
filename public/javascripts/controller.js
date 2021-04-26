class Controller {
  constructor(todos, view) {
    this.todosModel = todos;
    this.view = view;
    this.currentListTitle = 'All Todos';
    this.todos = [];
    this.done = [];
    this.todos_by_date = {};
    this.done_todos_by_date = {};
    this.selected = [];
    this.currentSelection = { mode: "all", filter: false };

    this.bindEvents();
    this.draw();
  }

  draw() {
    this.todosModel.getGroupedTodos().then((data) => {
      this.todos = data.all;
      this.done = data.completed;
      this.todos_by_date = data.todos_by_date;
      this.done_todos_by_date = data.done_todos_by_date;
      this.selected = this.updateSelected(this.currentSelection);
      this.view.renderCurrentList(this.buildContext());
    });
  }


  buildContext() {
    const context = {};

    context.current_section = {
      title: this.currentListTitle,
      data: this.selected.length
    };
    context.done_todos_by_date = this.done_todos_by_date;
    context.todos_by_date = this.todos_by_date;
    context.done = this.done;
    context.todos = this.todos;
    context.selected = this.selected;

    return context;
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const title = $(e.target).find('input[name="title"]').val(); 

    if(title.length < 3) {
      alert("You must enter a title at least 3 characters long.");
      return;
    }

    this.closeModal();
    let mode = e.target.dataset.mode;
    let data = this.buildJSON(new FormData(e.target));

    if(mode === 'add') {
      this.addNewTodo(data);
    } else if(mode === 'edit') {
      this.editTodo(e.target.dataset.id, data);
    }
  }

   buildJSON(formData) {
    const json = {};
    for(const [key, value] of formData.entries()) {
      json[key] = value;
    }
    return json;
  }

  editTodo(id, data) {
    this.todosModel.updateTodo(id, data).then((data) => {
      this.draw();
    });
  }

  addNewTodo(data) {
    this.todosModel.addTodo(data).then(data => {
      this.currentListTitle = 'All Todos';
      this.currentSelection = { mode: "all", filter: false };
      this.draw();
    });
  }

  newTodoForm() {
    this.view.blankForm();
  }

  closeModal() {
    this.view.hideModal();
  }

  async deleteTodo(e) {
    const id = e.currentTarget.closest('tr').dataset.id;
    await this.todosModel.removeTodo(id)
    this.draw()
  }

  editTodoForm(e) {
    e.preventDefault();
    //e.stopPropagation();
    e.stopImmediatePropagation();
    const id = +e.currentTarget.closest('tr').dataset.id;
    this.todosModel.getTodo(id).then((data) => {
      this.view.editForm(data);
    });
  }

  toggleComplete(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    const complete = $(e.target).closest('td.list_item').find('input[type="checkbox"]').attr('checked');

    const newValue = complete ? { completed: false } : { completed: true };
    this.todosModel.updateTodo(id, newValue).then(data => {
      console.log(data);
      this.draw();
    });
  }


  markCompleteHandler(e) {
    e.preventDefault();
    const form = e.target.closest('form');

    if(form.dataset.mode === 'add') {
      alert("You can't mark an item complete that hasn't been created yet!");
      return;
    }
    const id = form.dataset.id;
    this.todosModel.markTodoComplete(id).then(data => {
      console.log(data);
      this.draw();
      this.closeModal();
    })
  }

  updateSelected(options) {
    const title = this.currentListTitle;
    let {mode, filter} = options;

    this.selected = mode === "all" ? 
      (filter ? this.todos_by_date[title] : this.todos)
      : (filter ? this.done_todos_by_date[title] : this.done);
    
    if(typeof this.selected === "undefined") {
      this.selected = [];
    }
    
    return this.selected;
  }

  handleSelection(e, options) {
    const title = e.target.closest('[data-title]').dataset.title;
    const {mode, filter} = options;
    this.currentListTitle = title;
    this.currentSelection = options;
    this.draw();
  }

  bindEvents() {
    this.view.storeHandler('add todo', this.newTodoForm.bind(this));
    this.view.storeHandler('close modal', this.closeModal.bind(this));
    this.view.storeHandler('submit form', this.handleFormSubmit.bind(this));
    this.view.storeHandler('delete todo', this.deleteTodo.bind(this));
    this.view.storeHandler('click to edit', this.editTodoForm.bind(this));
    this.view.storeHandler('mark complete', this.markCompleteHandler.bind(this));
    this.view.storeHandler('toggle complete', this.toggleComplete.bind(this));
    this.view.storeHandler('select list all', this.handleSelection.bind(this));
    this.view.storeHandler('select list done', this.handleSelection.bind(this));
    this.view.storeHandler('select all', this.handleSelection.bind(this));
    this.view.storeHandler('select done', this.handleSelection.bind(this));
  }
}