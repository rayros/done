'use strict';
Polymer('todo-list', {
  newCategory: function() {
    this.$.drawer.closeDrawer();
    this.$.newCategory.open();
  },
  selectCategory: function(event) {
    todoDatabase.setCurrent('category', event.detail);
    this.updateTasks();
    this.$.drawer.closeDrawer();
  },
  updateAll: function() {
    this.$.categories.update();
    this.updateTasks();
  },
  resizeDropdowMenu: function() {
    var el = this.querySelector("::shadow paper-menu-button paper-dropdown::shadow #scroller")
    el.style.width = null;
    el.style.height = null;
  },
  updateTasks: function() {
    var _ = this;
    todoDatabase.current('category', function(categoryObject) {
      _.categoryName = categoryObject.name;
      _.$.remove.hidden = categoryObject.id === 1 ? true : false;
      _.resizeDropdowMenu();
      todoDatabase.tasks(categoryObject, 0, function(array) {
        var items = _.$.items;
        while (items.firstChild) {
          items.removeChild(items.firstChild);
        }
        items = _.$.itemsChecked;
        while (items.firstChild) {
          items.removeChild(items.firstChild);
        }
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
      
      todoDatabase.tasks(categoryObject, 1, function(array) {
        _.$.done.hidden = array.length ? false : true;
        array.forEach(function(object) {
          var el = document.createElement('todo-item');
          el.taskId = object.id;
          el.checked = object.checked;
          var name = document.createElement('name');
          name.innerHTML = object.name;
          el.appendChild(name);
          _.$.itemsChecked.appendChild(el);
        });
      });
    });
  },
  ready: function() {
    var _ = this;
    todoDatabase.init(function() {
      _.updateAll();
    });
    _.$.edit.onclick = function() {
      todoDatabase.current('category', function(categoryObject) {
        _.$.newCategory.open(categoryObject);
      });
    };
    _.$.remove.onclick = function() {
      todoDatabase.current('category', function(categoryObject) {
        todoDatabase.deleteCategory(categoryObject.id, function() {
          todoDatabase.categories(function(array) {
            todoDatabase.setCurrent('category', array[0]);
            _.updateAll();
          })
        });
      });
    };
    _.$.reset.onclick = function() {
      todoDatabase.deleteDB();
      location.reload();
    };
  },
  addTask: function() {
    this.$.newTask.open();
  },
  editTask: function(e) {
    this.$.newTask.open(e.detail);
  }
});
