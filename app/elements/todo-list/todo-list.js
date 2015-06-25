'use strict';
Polymer('todo-list', {
  category: null,
  items: {},
  initTasks: function(category) {
    var _ = this;
    _.category = category;
    function createTask(task) {
      var el = _.items[task.id] = document.createElement('todo-item'), 
      name = document.createElement('name');
      el.taskId = task.id;
      el.id = 'task' + task.id;
      el.checked = task.checked;
      name.innerHTML = task.name;
      el.appendChild(name);
      return el;
    }
    function renderTask(container) {
      return function(task) {
        var el = createTask(task);
        container.appendChild(el);
      };
    }
    function renderTasks(container, checked) {
      todoDatabase.tasks(category, checked, function(array) {
        _.$.done.hidden = array.length && checked ? false : true;
        var render = renderTask(container);
        array.forEach(render);
      });
    }
    renderTasks(_.$.items, 0);
    renderTasks(_.$.itemsChecked, 1);
    
    window.addEventListener('new-task.' + _.category, function(e) {
      var task = createTask(e.detail), 
      first = _.$.items.firstChild;
      _.$.items.insertBefore(task, first);
    });
    window.addEventListener('update-task.' + _.category, function(e) {
      var task = _.items[e.detail.id];
      task.setName(e.detail.name);
      setTimeout(function() {
        var dest = e.detail.checked === 0 ? _.$.items : _.$.itemsChecked, 
        first = dest.firstChild;
        dest.insertBefore(task, first);
        _.$.done.hidden = _.$.itemsChecked.getElementsByTagName('*').length ? false : true;
      }, 3000);
    });
    window.addEventListener('delete-task.' + _.category, function(e) {
      _.items[e.detail].remove();
      delete _.items[e.detail];
    });
  }
});
