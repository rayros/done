console.log('kell');

Polymer('todo-item',{
  name: 'asdasd',
  checked: false,
  sub_items: [],
  ready: function() {
    this.sub_items = this.$.sub_items.getDistributedNodes();
    if(this.sub_items.length) {
      this.$.arrow.hidden = false;
    }
  },
  showHandler: function() {
    this.$.sub_items_container.hidden = this.$.sub_items_container.hidden ? false : true;
  },
  checkHandler: function() {
    this.checked = this.checked ? false : true;
    for(var item = 0; item < this.sub_items.length; ++item) {
      var a = this.sub_items[item];
      a.$.checkbox.checked =  this.$.checkbox.checked ? true :false;
      a.checked = this.checked ? true : false;
    }
  }
});