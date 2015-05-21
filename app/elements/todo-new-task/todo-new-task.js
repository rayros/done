'use strict';
Polymer('todo-new-task', {
  ready: function() {
    var _ = this;
    _.$.back.onclick = function() {
      _.hidden = true;
    };
    _.$.check.onclick = function() {
      if(_.$.name.value == '' || _.$.categories.selectedItemLabel == '') {
         return false;
      }
      todoDatabase.addTask(_.$.name.value);
      _.fire('update-tasks');
      _.hidden = true;
      _.$.name.value = '';
    };
  }
});
