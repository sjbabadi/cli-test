class View {
  constructor() {
    this.templates = [];
    this.elements = [];
    this.handlers = {};
    const self = this;
    
    this.events = {
      'add todo': function(handler) {
        $(self.elements['addTodoLabel']).on('click', () => handler());
      },
      'close modal': function(handler) {
        $(self.elements['modal_layer']).on('click', () => handler());
      },
      'submit form': function(handler) {
        $(self.elements.form).on('submit', (e) => handler(e));
      },
      'delete todo': function(handler) {
        $(self.elements.table).on('click', 'td.delete', (e) => handler(e));
      },
      'click to edit': function(handler) {
        $(self.elements.table).on('click', "label[for*='item_']", (e) => handler(e)); 
      },
      'mark complete': function(handler) {
        $(self.elements.completeBtn).on('click', (e) => handler(e));
      },
      'toggle complete': function(handler) {
        $(self.elements.table).on('click', 'td.list_item', (e) => handler(e));
      },
      'select list all': function(handler) {
        $(self.elements.all_lists_section).on('click', 'dl', (e) => handler(e, {mode: 'all', filter: true}));
      },
      'select list done': function(handler) {
        $(self.elements.done_lists_section).on('click', 'dl', (e) => handler(e, { mode: 'done', filter: true }));
      },
      'select all': function(handler) {
        $(self.elements.all_selection).on('click', (e) => handler(e, { mode: 'all', filter: false }));
      },
      'select done': function(handler) {
        $(self.elements.done_selection).on('click', (e) => handler(e, { mode: 'done', filter: false }));
      }
  };
    
    this.cacheTemplates();
  }

  getElementReferences() {
    this.elements['addTodoLabel'] = document.querySelector("label[for='new_item']");
    this.elements['formDiv'] = document.querySelector('#form_modal');
    this.elements['form'] = this.elements.formDiv.firstElementChild;
    this.elements['modal_layer'] = document.querySelector('#modal_layer');
    this.elements['submitBtn'] = document.querySelector("input[type='submit]");
    this.elements['table'] = document.querySelector('table');
    this.elements['completeBtn'] = document.querySelector('button[name="complete"]');
    this.elements['all_lists_section'] = document.querySelector('article#all_lists');
    this.elements['done_lists_section'] = document.querySelector('article#completed_lists');
    this.elements['all_selection'] = document.querySelector('#all_todos dl');
    this.elements['done_selection'] = document.querySelector('#completed_todos dl');
  }

  cacheTemplates() {
    const templateList = document.querySelectorAll("script[type='text/x-handlebars']");
    templateList.forEach((template) => {
      if(template.dataset.type === "partial") {
        Handlebars.registerPartial(template.id, template.innerHTML);
      } else {
        this.templates[template.id] = Handlebars.compile(template.innerHTML);
      }
    });
  }

  renderCurrentList(context) {
    document.body.innerHTML = '';
    document.body.insertAdjacentHTML('afterbegin', this.templates['main_template']({
      current_section: context.current_section,
      selected: context.selected,
      done_todos_by_date: context.done_todos_by_date,
      todos_by_date: context.todos_by_date,
      done: context.done,
      todos: context.todos
    }));
    this.getElementReferences();
    this.bindEvents();
  }

  blankForm() {
    this.elements.form.reset();
    this.elements.form.dataset.mode = "add";
    this.renderModal();
  }

  editForm(data) {
    this.elements.form.reset();
    this._populateForm(data);
    this.elements.form.dataset.mode = 'edit';
    this.elements.form.dataset.id = data.id;
    this.renderModal();
  }

  _populateForm(data) {
    const $form = $(this.elements.form);
    $form.find('input[name="title"]').val(data.title);
    $form.find('select[name="day"]').val(data.day).change();
    $form.find('select[name="month"]').val(data.month).change();
    $form.find('select[name="year"]').val(data.year).change();
    $form.find('textarea[name="description"]').val(data.description).change();
  }

  renderModal() {
    $(this.elements.modal_layer).show();
    $(this.elements.formDiv).show();
  }

  hideModal() {
    $(this.elements.modal_layer).hide();
    $(this.elements.formDiv).hide(); 
  }

  bindEvents() {
    for(const event in this.events) { // each key is event string (e.g 'add todo')
      this.events[event](this.handlers[event]);
    }
  }

  storeHandler(event, handler) {
    this.handlers[event] = handler;
  }


}