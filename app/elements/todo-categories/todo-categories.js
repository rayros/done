'use strict';
Polymer('todo-categories', {
  items: {},
  ready: function() {
    var _ = this;
    _.$.add.onclick = function() {
      _.fire('new-category');
    };
    _.update();
  },
  update: function() {
    var _ = this;
    todoDatabase.current('category', function(currentCategory) {
      todoDatabase.categories(function(array) {
        array.forEach(function(category, index) {
          var item = _.items[category.id] = document.createElement('core-item');
          item.label = category.name;
          item.onclick = function() {
            todoDatabase.setCurrent('category', category);
          };
          _.$.items.appendChild(item);
          if (currentCategory.id === category.id) {
            _.$.items.selected = index;
          }
        });
      });
    });
  }
});
