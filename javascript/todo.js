;(function (document, localStorage) {
  /* Task objects for a key element in the model/view architecture. Task
   * objects have a {string} description and a {boolean} done flag.
   * {
   *   'description' : "Some task to be here.",
   *   'done'        : false
   * }
   */

  var TodoModel = function (key, view) {
    /* Takes a @param key to look up in the localStorage. If found, constructs
     * a todo list out of the contents.  Notifies @param view when model
     * updates. @param view maybe an object or an array of objects with an
     * update(tasks) method.
     */
    this.key = key;
    this.view = view;
    this.tasks = [];

    this.load();
    this.notify();
  };

  (function(TodoModel) {
    // Add all prototype methods for TodoModel
    var _pro = TodoModel.prototype;
    var _first_time_tasks = [{
      'done': false,
      'description': 'This is a todo list'
    }, {
      'done': true,
      'description': 'This is a completed task'
    }, {
      'done': false,
      'description': 'You can add, remove or finish tasks'
    }];

    _pro.load = function() {
      /* Load tasks from localStorage */
      var string = localStorage.getItem(this.key);

      if (string === null) {
        this.tasks = _first_time_tasks; 
        this.store();
      } else {
        // String found in localStorage, parse it
        this.tasks = JSON.parse(string);
      }
    };

    _pro.store = function() {
      /* Save tasks to localStorage */
      localStorage.setItem(this.key, JSON.stringify(this.tasks));
      console.log(this.tasks);
    };

    _pro.notify = function() {
      /* Notifies views of the changes by sending them the entire tasks list.
       */
      if (this.view.length !== undefined) {
        // Views are supplied as a list
        var v = this.view,
            t = this.tasks;

        for (var i=0; i<v.length; i++) {
          v[i].update(t);
        }
      } else {
        this.view.update(this.tasks);
      }
    };

    _pro.update = function(tasks, stop_notify) {
      /* Update the tasks attribute with the supplied @param tasks.
       * Automatically calls store(). */
      this.tasks = tasks;
      this.store();

      if (stop_notify !== undefined) {
        return;
      }

      this.notify();
    };
  })(TodoModel);

  var TodoView = function(selector) {
    /* Takes a @param selector and renders the view within it. */
    this.selector = document.getElementById(selector); 
  };

  (function(TodoView) {
    // Attach prototype methods
    var _pro = TodoView.prototype;

    _pro.update = function(tasks) {
      /* Invoked by the model on state changes */
      this.selector.innerHTML = '';

      var i, task, li, actn, rm_btn, ed_btn, fin_btn
          ul = document.createElement('ul');

      for (i=0; i<tasks.length; i++) {
        task = tasks[i];

        // construct main text
        li = document.createElement('li');
        li.className = task.done ? 'done' : 'not-done';
        li.innerHTML = task.description;

        // construct action buttons
        actn = document.createElement('div');
        actn.className = 'action';

        rm_btn = document.createElement('a');
        rm_btn.innerHTML = '<i class="icon-remove icon-white"></i>';
        rm_btn.href = '#todo-rm:' + i;
        rm_btn.className = 'remove';

        ed_btn = document.createElement('a');
        ed_btn.innerHTML = '<i class="icon-pencil icon-white"></i>';
        ed_btn.href = '#todo-ed:' + i;
        ed_btn.className = 'edit';

        fin_btn = document.createElement('a');
        fin_btn.innerHTML = '<i class="icon-ok icon-white"></i>';
        fin_btn.href = 'todo-fin:' + i;
        fin_btn.className = 'finish';

        actn.appendChild(rm_btn);
        actn.appendChild(ed_btn);
        actn.appendChild(fin_btn);

        li.appendChild(actn);

        ul.appendChild(li);
      }

      this.selector.appendChild(ul);
    }
  })(TodoView);

  var setupTodo = function (key) {
    var view = new TodoView('todo-list');
        model = new TodoModel(key, view);
  };

  // Initiailization
  document.addEventListener('DOMContentLoaded', function() {
    setupTodo('todo');
  });
})(document, localStorage);
