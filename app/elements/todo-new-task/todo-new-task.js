'use strict';
Polymer('todo-new-task', {
  currentId: null,
  ready: function() {
    var _ = this;
    _.$.check.onclick = this.addHandler.bind(this);
  },
  backHandler: function () {
    this.hidden = true;
    this.$.name.value = '';
  },
  open: function(id) {
    var _ = this;
    if(id !== undefined) {
      _.currentId = id;
      todoDatabase.getTask(id, function(object) {
        _.$.name.value = object.name;
      });
    } else {
      _.currentId = null;
    }
    this.hidden = false;
    this.$.name.focus();
  },
  addHandler: function() {
    var _ = this;
    if (_.$.name.value === '') {
      return false;
    }
    todoDatabase.current('category', function(categoryObject) {
      if(_.currentId) {
        todoDatabase.updateTask(_.currentId, { name: _.$.name.value });
      } else {
        todoDatabase.addTask(_.$.name.value, categoryObject);
      }
      _.fire('update-tasks');
      _.hidden = true;
      _.$.name.value = '';
    });
  }
});
