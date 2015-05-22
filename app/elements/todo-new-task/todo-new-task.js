'use strict';
Polymer('todo-new-task', {
  ready: function() {
    var _ = this;
    _.$.check.onclick = this.addHandler.bind(this);
  },
  backHandler: function () {
    this.hidden = true;
    this.$.name.value = '';
  },
  open: function() {
    this.hidden = false;
    this.$.name.focus();
  },
  addHandler: function() {
    var _ = this;
    if (_.$.name.value === '') {
      return false;
    }
    todoDatabase.current('category', function(categoryObject) {
      todoDatabase.addTask(_.$.name.value, categoryObject);
      _.fire('update-tasks');
      _.hidden = true;
      _.$.name.value = '';
    });
  }
});
