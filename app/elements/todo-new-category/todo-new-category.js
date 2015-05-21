'use strict';
Polymer('todo-new-category', {
  ready: function() {
    var _ = this;
    _.$.back.onclick = function() {
      _.hidden = true;
    };
    _.$.check.onclick = _.addHandler.bind(this);
  },
  addHandler: function() {
    var _ = this;
    todoDatabase.addCategory(_.$.name.value, function(id) {
      todoDatabase.setCurrent('category', id);
      _.fire('update-categories');
      _.hidden = true;
      _.$.name.value = '';
    });
  },
  open: function() {
    this.hidden = false;
    this.$.name.focus();
  }
});
