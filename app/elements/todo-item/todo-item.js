'use strict';
Polymer('todo-item', {
  checked: false,
  taskId: null,
  subItems: [],
  parent: null,
  constr: function(task) {
    var _ = this;
    _.taskId = task.id;
    _.id = 'task' + task.id;
    _.checked = task.checked;
    _.name = task.name;
    if (task.subtasks && task.subtasks.length) {
      _.$.arrow.hidden = false;
      _.subItems.forEach(function(item) {
        item.remove();
      });
      _.subItems = [];
      task.subtasks.forEach(function(subtask) {
        var el = new TodoItem();
        el.parent = _;
        el.$.edit.hidden = true;
        el.name = subtask.name;
        el.checked = subtask.checked;
        _.subItems.push(el);
        _.appendChild(el);
      });
    }
  },
  setName: function(string) {
    this.querySelector('name').innerHTML = string;
  },
  editHandler: function() {
    this.fire('edit-task', this.taskId);
  },
  arrowHandler: function() {
    this.$.subItemsContainer.hidden = this.$.subItemsContainer.hidden ? false : true;
  },
  checkboxHandler: function() {
    var _ = this;
    function serializeTask(task) {
      var subtasks = task.subItems.map(function(subtask) {
        return {
          name: subtask.name,
          checked: subtask.checked ? 1 : 0
        };
      });
      return {
        checked: task.checked ? 1 : 0,
        subtasks: subtasks
      };
    }
    _.checked = _.checked ? false : true;
    _.subItems.forEach(function(el) {
      el.checked = _.checked;
    });
    var master = _.parent ? _.parent : _;
    todoDatabase.updateTask(master.taskId, serializeTask(master));
  },
  checkedChanged: function() {
    this.$.checkbox.checked = this.checked;
  }
});
