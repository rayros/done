'use strict';
Polymer('todo-new-category', {
  ready: function() {
    var _ = this;
    _.$.back.onclick = function() {
      _.hidden = true;
    };
    _.$.check.onclick = function() {
      todoDatabase.addCategory(_.$.name.value, function(id) {
        todoDatabase.setCurrent('category', id);
        _.fire('update-categories');
        _.hidden = true;
        _.$.name.value = '';
      });
    
    };
  }
});
