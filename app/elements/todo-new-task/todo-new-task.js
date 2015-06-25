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
  },
  backHandler: function() {
    this.hidden = true;
    this.$.name.value = '';
  },
  open: function(id) {
    var _ = this;
    
    if (id !== undefined) {
      _.currentId = id;
      _.title = 'Edit task';
      todoDatabase.getTask(id, function(object) {
        _.$.name.value = object.name;
        _.$.delete.hidden = false;
        _.hidden = false;
        _.$.name.blur();
      });
    } else {
      _.currentId = null;
      _.title = 'New task';
      _.$.delete.hidden = true;
      _.hidden = false;
      _.$.name.focus();
    }
  },
  addHandler: function() {
    var _ = this;
    if (_.$.name.value === '') {
      return false;
    }
    todoDatabase.current('category', function(categoryObject) {
      if (_.currentId) {
        todoDatabase.updateTask(_.currentId, {name: _.$.name.value});
      } else {
        todoDatabase.addTask(_.$.name.value, categoryObject);
      }
      _.fire('update-tasks');
      _.hidden = true;
      _.$.name.value = '';
    });
  }
});
