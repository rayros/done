(function() {
  window.todoDatabase = {
    version: 106,
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
      return window.indexedDB ? success.call(this) : error.call(this);
    },
    init: function() {
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
        var objectStores = db.objectStoreNames;
        if (!objectStores.contains('tasks')) {
          var task = db.createObjectStore('tasks', {keyPath: 'id',autoIncrement: true});
          task.createIndex('category', 'category', {unique: false});
        }
        if (!objectStores.contains('categories')) {
          db.createObjectStore('categories', {keyPath: 'id',autoIncrement: true});
        }
        if (!objectStores.contains('current')) {
          db.createObjectStore('current', {keyPath: 'key'});
          _.addCategory('events');
          _.setCurrent('category', {id: 1,name: 'events'});
        }
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
          console.log('DB:[current] key: ' + key + ' value: ', value);
        };
      });
    },
    current: function(key, success) {
      var _ = this;
      _.transaction('current', function(t) {
        var request = t.objectStore('current').get(key);
        request.onsuccess = function(e) {
          success(e.target.result.value);
        };
      });
    },
    addTask: function(name, categoryObject) {
      this.transaction('tasks', function(t) {
        var c = t.objectStore('tasks');
        var req = c.add({name: name,category: categoryObject.id,checked: false});
        req.onsuccess = function() {
          console.log('DB: add task ' + name + ' to category ', categoryObject);
        };
      });
    },
    updateTask: function(taskId, object) {
      var _ = this;
      this.transaction('tasks', function(t) {
        var objectStore = t.objectStore('tasks');
        var req = objectStore.get(taskId);
        req.onsuccess = function(e) {
          var data = e.target.result;
          objectStore.put(_.merge(data, object));
          console.log('DB: update task ' + name);
        };
      });
    },
    tasks: function(categoryObject, success) {
      var _ = this;
      var array = [];
      _.transaction('tasks', function(t) {
        var index = t.objectStore('tasks').index('category');
        var request = index.openCursor(IDBKeyRange.only(categoryObject.id), 'prev');
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
    addCategory: function(string, success) {
      this.transaction('categories', function(t) {
        var c = t.objectStore('categories');
        var req = c.add({name: string.toLowerCase()});
        req.onsuccess = function(e) {
          console.log('add category');
          if (success !== undefined) {
            success({id: e.target.result,name: string});
          }
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
    },
    merge: function(obj1, obj2) {
      var obj3 = {};
      for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
      }
      for (var attrname2 in obj2) {
        obj3[attrname2] = obj2[attrname2];
      }
      return obj3;
    }
  };
})();
