'use strict';
Polymer('todo-new-category', {
  ready: function() {
  },
  backHandler: function() {
    this.hidden = true;
    this.$.name.value = '';
  },
  addHandler: function() {
    var _ = this;
    function ok() {
      _.$.name.value = '';
      _.hidden = true;
    }
    if (_.$.name.value === '') {
      return false;
    }
    if (_.currentId) {
      todoDatabase.updateCategory(_.currentId, {name: _.$.name.value}, function(categoryObject) {
        todoDatabase.setCurrent('category', categoryObject, function() {
          ok();
        });
      });
    } else {
      todoDatabase.addCategory(_.$.name.value, function(categoryObject) {
        todoDatabase.setCurrent('category', categoryObject, function() {
          ok();
        });
      });
    }
  },
  open: function(categoryObject) {
    if (categoryObject !== undefined) {
      this.currentId = categoryObject.id;
      this.$.name.value = categoryObject.name;
    } else {
      this.currentId = null;
    }
    this.hidden = false;
    this.$.name.focus();
  }
});
