'use strict';
Polymer('todo-new-task', {
  currentId: null,
  title: '',
  ready: function() {
    var _ = this;
    _.$.check.onclick = this.addHandler.bind(this);
    _.$.delete.onclick = function() {
      todoDatabase.deleteTask(_.currentId);
      _.backHandler();
    };
    _.$.addSubtask.onclick = function() {
      var subtask = new Subtask();
      _.$.subtasks.appendChild(subtask);
      _.$.fields.scrollTop = _.$.fields.scrollHeight;
      subtask.focus();
    };

  },
  backHandler: function() {
    this.hidden = true;
    this.$.name.value = '';
  },
  open: function(id) {
    var _ = this;
    function removeSubtasks() {
      _.$.subtasks.children.array().forEach(function(el) {
        el.remove();
      });
    }
    function deserializeSubtasks(array) {
      removeSubtasks();
      array.forEach(function(subtask) {
        var el = new Subtask();
        el.name = subtask.name;
        el.checked = subtask.checked;
        _.$.subtasks.appendChild(el);
      });
    }
    if (id !== undefined) {
      _.currentId = id;
      _.title = 'Edit task';
      todoDatabase.getTask(id, function(object) {
        _.$.name.value = object.name;
        _.$.delete.hidden = false;
        _.hidden = false;
        deserializeSubtasks(object.subtasks);
      });
    } else {
      _.currentId = null;
      _.title = 'New task';
      _.$.delete.hidden = true;
      _.hidden = false;
      removeSubtasks();
      _.$.name.focus();
    }
  },
  addHandler: function() {
    var _ = this;
    function serializeSubtasks() {
      return _.$.subtasks.children.array()
      .filter(function(subtask) {
        return subtask.name !== '';
      })
      .map(function(subtask) {
        return {name: subtask.name,checked: subtask.checked};
      });
    }
    if (_.$.name.value === '') {
      return false;
    }
    todoDatabase.current('category', function(categoryObject) {
      if (_.currentId) {
        todoDatabase.updateTask(_.currentId, {name: _.$.name.value, subtasks: serializeSubtasks()});
      } else {
        todoDatabase.addTask(_.$.name.value, categoryObject, serializeSubtasks());
      }
      _.hidden = true;
      _.$.name.value = '';
    });
  }

});
