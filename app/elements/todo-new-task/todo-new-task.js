'use strict';
Polymer('todo-new-task', {
  ready: function() {
    var _ = this;
    _.$.back.onclick = function() {
      _.hidden = true;
    };
    _.$.check.onclick = function() {
      if(_.$.name.value === '') {
         return false;
      }
      todoDatabase.current('category', function(categoryObject) {
        todoDatabase.addTask(_.$.name.value, categoryObject);
        _.fire('update-tasks');
        _.hidden = true;
        _.$.name.value = '';
      });

    };
  }
});
