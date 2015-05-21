'use strict';
Polymer('todo-categories', {
  ready: function() {
    var _ = this;
    _.$.add.onclick = function() {
      _.fire('new-category');
    };
    _.update();
  },
  update: function() {
    var _ = this, 
    items = _.$.items;
    while (items.firstChild) {
      items.removeChild(items.firstChild);
    }
    todoDatabase.categories(function(array) {
      array.forEach(function(object) {
        var el = document.createElement('core-item');
        el.label = object.name;
        el.onclick = function() {
          _.fire('select-category', object.id);
        };
        _.$.items.appendChild(el);
      });
    });
  }
});
