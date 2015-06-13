'use strict';
Polymer('todo-main', {
  lists: {},
  visible: null,
  domReady: function() {
    var _ = this;
    setTimeout(function() {
      _.classList.add('show');
    }, 1200);
  },
  ready: function() {
    var _ = this;
    todoDatabase.categories(function(array) {
      array.forEach(function(category) {
        var list = _.lists[category.id] = document.createElement('todo-list');
        list.category = category.id;
        list.hidden = true;
        list.updateTasks();
        _.$.lists.appendChild(list);
      });
      todoDatabase.current('category', function(category) {
        _.categoryName = category.name;
        _.visible = _.lists[category.id];
        _.visible.hidden = false;
      });
    });
    window.addEventListener('current.category', function(e) {
      _.categoryName = e.detail.name;
      _.visible.hidden = true;
      _.visible = _.lists[e.detail.id];
      _.visible.hidden = false;
      _.$.drawer.closeDrawer();
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
          });
        });
      });
    };
    _.$.reset.onclick = function() {
      todoDatabase.deleteDB(function() {
        location.reload();
      });
    };
  
  },
  resizeDropdowMenu: function() {
    var el = this.querySelector('::shadow paper-menu-button paper-dropdown::shadow #scroller');
    el.style.width = null;
    el.style.height = null;
  },
  newCategory: function() {
    this.$.drawer.closeDrawer();
    this.$.newCategory.open();
  },
  newTask: function() {
    this.$.newTask.open();
  },
  editTask: function(e) {
    this.$.newTask.open(e.detail);
  }
});
