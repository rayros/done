 /*jshint -W030 */
'use strict';
(function() {
  window.todoDatabase = {
    version: 3,
    name: 'todo',
    polyfill: function(success, error) {
      function isIOS8() {
        var deviceAgent = navigator.userAgent.toLowerCase();
        return /(iphone|ipod|ipad).* os 8_/.test(deviceAgent);
      }
      this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
      this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange || window.shimIndexedDB.modules.IDBKeyRange;
      if (isIOS8()) {
        this.indexedDB = window.shimIndexedDB;
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
        function version(event) {
          return {
            check: function(version) {
              if (event.oldVersion < version && event.newVersion >= version) {
                DEBUG && console.log('DB: Upgrading to version: ' + version);
                return true;
              } else {
                return false;
              }
            }
          };
        }
        DEBUG && console.log('DB: Upgrading...');
        var db = event.target.result;
        var t = event.target.transaction;
        var v = version(event);
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
        var current = t.objectStore('current');
        var object = {
          key: key,
          value: value
        };
        var req = current.put(object);
        req.onsuccess = function() {
          DEBUG && console.log('DB:[current] key: ' + key + ' value: ', value);
          // Event: "delete-task.x" where x = category id
          var event = new CustomEvent('current.' + key, {
            detail: value
          });
          window.dispatchEvent(event);
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
    addTask: function(name, categoryObject, subtasks) {
      var _ = this;
      _.transaction('tasks', function(t) {
        var tasks = t.objectStore('tasks');
        var task = {
          name: name,
          category: categoryObject.id,
          checked: 0,
          subtasks: subtasks
        };
        var req = tasks.add(task);
        req.onsuccess = function(e) {
          DEBUG && console.log('DB: Add task "' + name + '" to category "' + categoryObject.name + '"');
          // Event: "new-task.x" where x = category id
          var event = new CustomEvent('new-task.' + task.category, {
            detail: _.merge(task, {id: e.target.result})
          });
          window.dispatchEvent(event);
        };
      });
    },
    updateTask: function(taskId, updateTask) {
      var _ = this;
      this.transaction('tasks', function(t) {
        var objectStore = t.objectStore('tasks');
        var req = objectStore.get(taskId);
        req.onsuccess = function(e) {
          var task = _.merge(e.target.result, updateTask);
          objectStore.put(task);
          DEBUG && console.log('DB: update task ' + task.name);
          // Event: "update-task.x" where x = category id
          var event = new CustomEvent('update-task.' + task.category, {
            detail: task
          });
          window.dispatchEvent(event);
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
      var _ = this;
      _.getTask(taskId, function(task) {
        _.transaction(['tasks'], function(t) {
          var tasks = t.objectStore('tasks');
          var request = tasks.delete(taskId);
          request.onsuccess = function(e) {
            DEBUG && console.log('DB: delete task: ' + task.name);
            // Event: "delete-task.x" where x = category id
            var event = new CustomEvent('delete-task.' + task.category, {
              detail: taskId
            });
            window.dispatchEvent(event);
            if (success) {
              success(e);
            }
          };
        });
      });
    },
    tasks: function(categoryId, checked, success) {
      var _ = this;
      var array = [];
      _.transaction('tasks', function(t) {
        var index = t.objectStore('tasks').index('category, checked');
        var request = index.openCursor(_.IDBKeyRange.only([categoryId, checked]), 'prev');
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
      var _ = this;
      _.transaction('categories', function(t) {
        var categories = t.objectStore('categories');
        var category = {
          name: string
        };
        var req = categories.add(category);
        req.onsuccess = function(e) {
          DEBUG && console.log('DB: Add category');
          // Event: "delete-task.x" where x = category id
          var event = new CustomEvent('add-category', {
            detail: _.merge(category, {id: e.target.result})
          });
          window.dispatchEvent(event);
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
          var category = _.merge(e.target.result, object);
          objectStore.put(category);
          DEBUG && console.log('DB: update category ' + category.name);
          var event = new CustomEvent('update-category', {
            detail: category
          });
          window.dispatchEvent(event);
          if (success) {
            success(category);
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
              DEBUG && console.log('DB: remove category by id: ' + categoryId);
              var event = new CustomEvent('delete-category', {
                detail: categoryId
              });
              window.dispatchEvent(event);
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
        DEBUG && console.log('Deleted database successfully');
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
