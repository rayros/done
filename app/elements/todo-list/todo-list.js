'use strict';
Polymer('todo-list',{
  newCategory: function() {
    this.$.drawer.closeDrawer();
    this.$.newCategory.hidden = false;
  },
  selectCategory: function(event) {
    todoDatabase.tasks(event.detail, function() {
      debugger;
    })
  },
  updateCategories: function() {
    this.$.categories.update();
  },
  ready: function() {
    var _ = this;
    _.$.add.onclick = function() {
      _.$.newTask.hidden = false;
    }
  }
});