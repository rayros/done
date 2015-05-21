'use strict';
Polymer('todo-list',{
  newCategory: function() {
    this.$.drawer.closeDrawer();
    this.$.newCategory.open();
  },
  selectCategory: function(event) {
    todoDatabase.setCurrent('category', event.detail);
    this.updateTasks();
    this.$.drawer.closeDrawer();
  },
  updateCategories: function() {
    this.$.categories.update();
    this.updateTasks();
  },
  updateTasks: function() {
    var _ = this,
    items = _.$.items;
    while (items.firstChild) {
      items.removeChild(items.firstChild);
    }
    todoDatabase.current('category', function(categoryObject) { 
      _.categoryName = categoryObject.name;
      todoDatabase.tasks(categoryObject, function(array) {
        array.forEach(function(object) {
          var el = document.createElement('todo-item');
          el.taskId = object.id;
          el.checked = object.checked;
          var name = document.createElement('name');
          name.innerHTML = object.name;
          el.appendChild(name);
          _.$.items.appendChild(el);
        });
      });
    });    
  },
  ready: function() {
    var _ = this;
    _.$.add.onclick = function() {
      _.$.newTask.open();
    };
    _.updateTasks();
  }
});