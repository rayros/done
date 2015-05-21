'use strict';
Polymer('todo-item',{
  checked: false,
  subItems: [],
  ready: function() {
    this.subItems = this.$.subItems.getDistributedNodes();
    if(this.subItems.length) {
      this.$.arrow.hidden = false;
    }
  },
  arrowHandler: function() {
    this.$.subItemsContainer.hidden = this.$.subItemsContainer.hidden ? false : true;
  },
  checkboxHandler: function() {
    this.checked = this.checked ? false : true;
    for(var index = 0; index < this.subItems.length; ++index) {
      var item = this.subItems[index];
      item.$.checkbox.checked = this.$.checkbox.checked ? true :false;
      item.checked = this.checked ? true : false;
    }
  }
});
