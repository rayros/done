'use strict';
Polymer('todo-item',{
  checked: false,
  taskId: null,
  subItems: [],
  ready: function() {
    this.subItems = this.$.subItems.getDistributedNodes();
    if(this.subItems.length) {
      this.$.arrow.hidden = false;
    }
  },
  setName: function(string) {
    this.querySelector('name').innerHTML = string;
  },
  editHandler: function() {
    this.fire('edit-task', this.taskId);
  },
  arrowHandler: function() {
    this.$.subItemsContainer.hidden = this.$.subItemsContainer.hidden ? false : true;
  },
  checkboxHandler: function() {
    var _ = this;
    _.checked = _.checked ? false : true;
    todoDatabase.updateTask(_.taskId, { checked: _.checked ? 1 : 0 });
    clearTimeout(window.timeout);
    window.timeout = setTimeout(function() {
      _.fire('update-tasks');
    }, 10000);
  },
  checkedChanged: function() {
    this.$.checkbox.checked = this.checked;
    for(var index = 0; index < this.subItems.length; ++index) {
      var item = this.subItems[index];
      item.$.checkbox.checked = this.$.checkbox.checked ? true :false;
      item.checked = this.checked ? true : false;
    }
  }
});
