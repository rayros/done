'use strict';
Polymer('todo-categories', {
  items: {},
  ready: function() {
    var _ = this;
    _.$.add.onclick = function() {
      _.fire('new-category');
    };
    todoDatabase.init(_.update.bind(_));
  },
  update: function() {
    var _ = this;
    function createCategory(category) {
      var item = _.items[category.id] = document.createElement('core-item');
      item.label = category.name;
      item.onclick = function() {
        todoDatabase.setCurrent('category', {name: item.label, id: category.id});
      };
      return item;
    }
    todoDatabase.current('category', function(currentCategory) {
      todoDatabase.categories(function(array) {
        array.forEach(function(category, index) {
          if(!_.items[category.id]) {
            _.$.items.appendChild(createCategory(category));
          }
          if (currentCategory.id === category.id) {
            _.$.items.selected = index;
          }
        });
      });
    });
    window.addEventListener('current.category', function(e) {
      var index = _.$.items.children.array().indexOf(_.items[e.detail.id]);
      _.$.items.selected = index;
    });
    window.addEventListener('add-category', function(e) {
      _.$.items.appendChild(createCategory(e.detail));
    });
    window.addEventListener('update-category', function(e) {
      _.items[e.detail.id].label = e.detail.name;
    });
    window.addEventListener('delete-category', function(e) {
      _.items[e.detail].remove();
      delete _.items[e.detail];
    });
  }
});
