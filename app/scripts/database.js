(function() {
  window.todoDatabase = {
    version: 103,
    name: 'todo',
    categoriesArray: [],
    polyfill: function(success, error) {
      // In the following line, you should include the prefixes of implementations you want to test.
      window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      // DON'T use 'var indexedDB = ...' if you're not in a function.
      // Moreover, you may need references to some window.IDB* objects:
      window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
      window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
      // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
      return window.indexedDB ? success.apply(this) : error.apply(this);
    },
    init: function() {
      var _ = this;
      this.polyfill(function() {
        this.open(function() {
          console.log('DB: open success');
        
        });
      }, function() {
        console.log('DB: Your browser doesn\'t support a stable version of IndexedDB.\n Such and such feature will not be available.');
      });
    },
    open: function(success) {
      var _ = this;
      var request = window.indexedDB.open(this.name, this.version);
      request.onsuccess = success;
      request.onupgradeneeded = function(event) {
        console.log('DB: upgrading new db.');
        var db = event.target.result;
        var task = db.createObjectStore('tasks', {keyPath: 'name'});
        task.createIndex('category', 'category', {unique: false});
        db.createObjectStore('categories', { keyPath: "id", autoIncrement:true });
        db.createObjectStore('current', {keyPath: 'key'});
        _.addCategory('events');
        _.setCurrent('category', 1);
      };
      request.onerror = function(event) {
        console.log('DB: error - ' + event.target.error.message);
      };
    },
    transaction: function(string, success) {
      this.open(function(event) {
        var db = event.target.result;
        var transaction = db.transaction([string], 'readwrite');
        // report on the success of opening the transaction
        transaction.oncomplete = function() {
          console.log('DB[' + string + '] Transaction opened.');
        };
        transaction.onerror = function(event) {
          console.log('DB: Transaction not opened due to error.');
          console.log(event.target.error.message);
        };
        success(transaction);
      });
    },
    setCurrent: function(key, value) {
      this.transaction('current', function(t) {
        var c = t.objectStore('current');
        var req = c.put({key: key,value: value});
        req.onsuccess = function() {
          console.log('DB:[current] key: ' + key + ' value: ' + value);
        };
      });
    },
    getCurrent: function(key, success) {
      var _ = this;
      _.transaction('current', function(t) {
        var request = t.objectStore('current').get(key);
        request.onsuccess = function(e) {
            success(e.target.result.value);
        };
      });
    },
    addTask: function(name, categoryId) {
      this.transaction('tasks', function(t) {
        var c = t.objectStore('tasks');
        var req = c.add({name: name, category: categoryId});
        req.onsuccess = function() {
          console.log('DB: add task ' + name + ' to category ' + categoryId);
        };
      });
    },
    tasks: function(categoryId, success) {
      var _ = this;
      var array = [];
      _.transaction('tasks', function(t) {
        var index = t.objectStore('tasks').index('category');
        var request = index.openCursor(IDBKeyRange.only(categoryId));
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            array.push(cursor.value);
            cursor.continue();
          } else {
            return success(array);
          }
        };
      });
    },
    addCategory: function(string) {
      this.transaction('categories', function(t) {
        var c = t.objectStore('categories');
        var req = c.add({ name: string.toLowerCase() });
        req.onsuccess = function() {
          console.log('add category');
        };
      });
    },
    categories: function(success) {
      var _ = this;
      var array = [];
      _.transaction('categories', function(t) {
        var c = t.objectStore('categories');
        c.openCursor().onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            array.push(cursor.value);
            cursor.continue();
          } else {
            return success(array);
          }
        };
      });
    },
    deleteDB: function() {
      var req = indexedDB.deleteDatabase(this.name);
      req.onsuccess = function() {
        console.log('Deleted database successfully');
      };
      req.onerror = function() {
        console.log('Couldn\'t delete database');
      };
      req.onblocked = function() {
        console.log('Couldn\'t delete database due to the operation being blocked');
      };
    }
  };
})();
