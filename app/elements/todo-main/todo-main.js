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
    function addTodoList(categoryId) {
      var list = _.lists[categoryId] = document.createElement('todo-list');
      list.hidden = true;
      list.initTasks(categoryId);
      _.$.lists.appendChild(list);
    }
    todoDatabase.categories(function(array) {
      array.forEach(function(category) {
        if(!_.lists[category.id]) {
          addTodoList(category.id);
        }
      });
      todoDatabase.current('category', function(category) {
        _.categoryName = category.name;
        _.visible = _.lists[category.id];
        _.visible.hidden = false;
      });
    });
    window.addEventListener('add-category', function(e) {
      addTodoList(e.detail.id);
    });
    window.addEventListener('delete-category', function(e) {
      var categoryId = e.detail;
      _.lists[categoryId].remove();
      delete _.lists[categoryId];
    });
    window.addEventListener('current.category', function(e) {
      _.categoryName = e.detail.name;
      if(_.visible) {_.visible.hidden = true; }
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
