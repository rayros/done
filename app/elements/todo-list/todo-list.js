'use strict';
Polymer('todo-list', {
  category: null,
  updateTasks: function() {
    var _ = this;
    todoDatabase.tasks(_.category, 0, function(array) {
      array.forEach(function(object) {
        var el = document.createElement('todo-item');
        el.taskId = object.id;
        el.id = 'task' + object.id;
        el.checked = object.checked;
        var name = document.createElement('name');
        name.innerHTML = object.name;
        el.appendChild(name);
        _.$.items.appendChild(el);
      });
    });
    
    todoDatabase.tasks(_.category, 1, function(array) {
      _.$.done.hidden = array.length ? false : true;
      array.forEach(function(object) {
        var el = document.createElement('todo-item');
        el.taskId = object.id;
        el.id = 'task' + object.id;
        el.checked = object.checked;
        var name = document.createElement('name');
        name.innerHTML = object.name;
        el.appendChild(name);
        _.$.itemsChecked.appendChild(el);
      });
    });
  },
  appendTask: function(task) {
    var first = this.$.items.firstChild;
    this.$.items.insertBefore(task, first);
  }
});
