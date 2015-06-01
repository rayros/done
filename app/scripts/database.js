(function() {
  window.todoDatabase = {
    version: 3,
    name: 'todo',
    categoriesArray: [],
    polyfill: function(success, error) {
      this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
      this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || window.shimIndexedDB.modules.IDBTransaction;
      this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange || window.shimIndexedDB.modules.IDBKeyRange;
      if(this.isIOS8()) {
          this.indexedDB = window.shimIndexedDB;
          this.IDBTransaction = window.shimIndexedDB.modules.IDBTransaction;
          this.IDBKeyRange = window.shimIndexedDB.modules.IDBKeyRange;
      }
      return this.indexedDB ? success.call(this) : error.call(this);
    },
    init: function(success) {
      this.polyfill(function() {
        this.open(success);
      }, function() {
        console.log('DB: Your browser doesn\'t support a stable version of IndexedDB.\n Such and such feature will not be available.');
      });
    },
    Version: function(event) {
      return {
        check: function(version) {
          if (event.oldVersion < version && event.newVersion >= version) {
            console.log('DB: Upgrading to version: ' + version);
            return true;
          } else {
            return false;
          }
        }
      };
    },
    isIOS8: function() {
      var deviceAgent = navigator.userAgent.toLowerCase();
      return /(iphone|ipod|ipad).* os 8_/.test(deviceAgent);
    },
    open: function(success) {
      var _ = this;
      var request = _.indexedDB.open(this.name, this.version);
      request.onsuccess = function(event) {
        if (success) {
          success(event);
        }
        event.target.result.close();
        return false;
      };
      request.onupgradeneeded = function(event) {
        console.log('DB: Upgrading...');
        var db = event.target.result;
        var t = event.target.transaction;
        var v = _.Version(event);
        var tasks;
        if (v.check(2)) {
          tasks = db.createObjectStore('tasks', {keyPath: 'id',autoIncrement: true});
          tasks.createIndex('category, checked', ['category', 'checked'], {unique: false});
          db.createObjectStore('categories', {keyPath: 'id',autoIncrement: true});
          db.createObjectStore('current', {keyPath: 'key'});
          _.addCategory('events');
          _.setCurrent('category', {id: 1,name: 'events'});
        }
        if (v.check(3)) {
          tasks = t.objectStore('tasks');
          tasks.createIndex('category', ['category'], {unique: false});
        }
      // Next migration
      // if (v.check(4)) {
      // }
      };
      request.onerror = function(event) {
        console.log('DB: error - ' + event.target.error.message);
      };
    },
    transaction: function(array, success) {
      this.open(function(event) {
        var db = event.target.result;
        var transaction = db.transaction(array, 'readwrite');
        transaction.onerror = function(event) {
          console.log('DB: Transaction not opened due to error.');
          console.log(event.target.error.message);
        };
        success(transaction);
      });
    },
    setCurrent: function(key, value, success) {
      this.transaction('current', function(t) {
        var c = t.objectStore('current');
        var req = c.put({key: key,value: value});
        req.onsuccess = function() {
          console.log('DB:[current] key: ' + key + ' value: ', value);
          if (success) {
            success();
          }
        };
      });
    },
    current: function(key, success) {
      var _ = this;
      _.transaction('current', function(t) {
        var request = t.objectStore('current').get(key);
        request.onsuccess = function(e) {
          success(e.target.result.value);
          return false;
        };
      });
    },
    addTask: function(name, categoryObject) {
      this.transaction('tasks', function(t) {
        var c = t.objectStore('tasks');
        var req = c.add({name: name,category: categoryObject.id,checked: 0});
        req.onsuccess = function() {
          console.log('DB: Add task "' + name + '" to category "' + categoryObject.name + '"');
        };
      });
    },
    updateTask: function(taskId, object) {
      var _ = this;
      this.transaction('tasks', function(t) {
        var objectStore = t.objectStore('tasks');
        var req = objectStore.get(taskId);
        req.onsuccess = function(e) {
          var data = _.merge(e.target.result, object);
          objectStore.put(data);
          console.log('DB: update task ' + data.name);
        };
      });
    },
    getTask: function(id, success) {
      var _ = this;
      _.transaction('tasks', function(t) {
        var request = t.objectStore('tasks').get(id);
        request.onsuccess = function(e) {
          success(e.target.result);
        };
      });
    },
    deleteTask: function(taskId, success) {
      this.transaction(['tasks'], function(t) {
        var tasks = t.objectStore('tasks');
        var req = tasks.delete(taskId);
        req.onsuccess = function(e) {
          console.log('DB: remove task by id: ' + taskId);
          if (success) {
            success(e);
          }
        };
      
      });
    },
    tasks: function(categoryObject, checked, success) {
      var _ = this;
      var array = [];
      _.transaction('tasks', function(t) {
        var index = t.objectStore('tasks').index('category, checked');
        var request = index.openCursor(_.IDBKeyRange.only([categoryObject.id, checked]), 'prev');
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
          console.log('DB: Add category');
          if (success) {
            success({id: e.target.result,name: string});
          }
        };
      });
    },
    updateCategory: function(categoryId, object, success) {
      var _ = this;
      this.transaction('categories', function(t) {
        var objectStore = t.objectStore('categories');
        var req = objectStore.get(categoryId);
        req.onsuccess = function(e) {
          var data = _.merge(e.target.result, object);
          objectStore.put(data);
          console.log('DB: update category ' + data.name);
          if (success) {
            success(data);
          }
        };
      });
    },
    deleteCategory: function(categoryId, success, error) {
      if (categoryId === 1) {
        if (error) {
          error();
        }
        return;
      }
      this.transaction(['categories', 'tasks'], function(t) {
        var categories = t.objectStore('categories');
        var tasks = t.objectStore('tasks');
        var indexCategory = tasks.index('category');
        var req = indexCategory.openCursor(IDBKeyRange.only([categoryId]));
        req.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            tasks.delete(cursor.value.id);
            cursor.continue();
          } else {
            var req = categories.delete(categoryId);
            req.onsuccess = function() {
              console.log('DB: remove category by id: ' + categoryId);
              if (success) {
                success(e);
              }
            };
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
    deleteDB: function(success) {
      var req = this.indexedDB.deleteDatabase(this.name);
      req.onsuccess = function() {
        console.log('Deleted database successfully');
        if (success) {
          success();
        }
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
