"use strict";!function(){window.todoDatabase={version:3,name:"todo",polyfill:function(e,t){function n(){var e=navigator.userAgent.toLowerCase();return/(iphone|ipod|ipad).* os 8_/.test(e)}return this.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB,this.IDBKeyRange=window.IDBKeyRange||window.webkitIDBKeyRange||window.msIDBKeyRange||window.shimIndexedDB.modules.IDBKeyRange,n()&&(this.indexedDB=window.shimIndexedDB,this.IDBKeyRange=window.shimIndexedDB.modules.IDBKeyRange),this.indexedDB?e.call(this):t.call(this)},init:function(e){this.polyfill(function(){this.open(e)},function(){console.log("DB: Your browser doesn't support a stable version of IndexedDB.\n Such and such feature will not be available.")})},open:function(e){var t=this,n=t.indexedDB.open(this.name,this.version);n.onsuccess=function(t){return e&&e(t),t.target.result.close(),!1},n.onupgradeneeded=function(e){function n(e){return{check:function(t){return e.oldVersion<t&&e.newVersion>=t?!0:!1}}}var o,a=e.target.result,r=e.target.transaction,s=n(e);s.check(2)&&(o=a.createObjectStore("tasks",{keyPath:"id",autoIncrement:!0}),o.createIndex("category, checked",["category","checked"],{unique:!1}),a.createObjectStore("categories",{keyPath:"id",autoIncrement:!0}),a.createObjectStore("current",{keyPath:"key"}),t.addCategory("events"),t.setCurrent("category",{id:1,name:"events"})),s.check(3)&&(o=r.objectStore("tasks"),o.createIndex("category",["category"],{unique:!1}))},n.onerror=function(e){console.log("DB: error - "+e.target.error.message)}},transaction:function(e,t){this.open(function(n){var o=n.target.result,a=o.transaction(e,"readwrite");a.onerror=function(e){console.log("DB: Transaction not opened due to error."),console.log(e.target.error.message)},t(a)})},setCurrent:function(e,t,n){this.transaction("current",function(o){var a=o.objectStore("current"),r={key:e,value:t},s=a.put(r);s.onsuccess=function(){var o=new CustomEvent("current."+e,{detail:t});window.dispatchEvent(o),n&&n()}})},current:function(e,t){var n=this;n.transaction("current",function(n){var o=n.objectStore("current").get(e);o.onsuccess=function(e){return t(e.target.result.value),!1}})},addTask:function(e,t,n){var o=this;o.transaction("tasks",function(a){var r=a.objectStore("tasks"),s={name:e,category:t.id,checked:0,subtasks:n},i=r.add(s);i.onsuccess=function(e){var t=new CustomEvent("new-task."+s.category,{detail:o.merge(s,{id:e.target.result})});window.dispatchEvent(t)}})},updateTask:function(e,t){var n=this;this.transaction("tasks",function(o){var a=o.objectStore("tasks"),r=a.get(e);r.onsuccess=function(e){var o=n.merge(e.target.result,t);a.put(o);var r=new CustomEvent("update-task."+o.category,{detail:o});window.dispatchEvent(r)}})},getTask:function(e,t){var n=this;n.transaction("tasks",function(n){var o=n.objectStore("tasks").get(e);o.onsuccess=function(e){t(e.target.result)}})},deleteTask:function(e,t){var n=this;n.getTask(e,function(o){n.transaction(["tasks"],function(n){var a=n.objectStore("tasks"),r=a.delete(e);r.onsuccess=function(n){var a=new CustomEvent("delete-task."+o.category,{detail:e});window.dispatchEvent(a),t&&t(n)}})})},tasks:function(e,t,n){var o=this,a=[];o.transaction("tasks",function(r){var s=r.objectStore("tasks").index("category, checked"),i=s.openCursor(o.IDBKeyRange.only([e,t]),"prev");i.onsuccess=function(e){var t=e.target.result;return t?(a.push(t.value),t.continue(),void 0):n(a)}})},addCategory:function(e,t){var n=this;n.transaction("categories",function(o){var a=o.objectStore("categories"),r={name:e},s=a.add(r);s.onsuccess=function(o){var a=new CustomEvent("add-category",{detail:n.merge(r,{id:o.target.result})});window.dispatchEvent(a),t&&t({id:o.target.result,name:e})}})},updateCategory:function(e,t,n){var o=this;this.transaction("categories",function(a){var r=a.objectStore("categories"),s=r.get(e);s.onsuccess=function(e){var a=o.merge(e.target.result,t);r.put(a);var s=new CustomEvent("update-category",{detail:a});window.dispatchEvent(s),n&&n(a)}})},deleteCategory:function(e,t,n){return 1===e?(n&&n(),void 0):(this.transaction(["categories","tasks"],function(n){var o=n.objectStore("categories"),a=n.objectStore("tasks"),r=a.index("category"),s=r.openCursor(IDBKeyRange.only([e]));s.onsuccess=function(n){var r=n.target.result;if(r)a.delete(r.value.id),r.continue();else{var s=o.delete(e);s.onsuccess=function(){var o=new CustomEvent("delete-category",{detail:e});window.dispatchEvent(o),t&&t(n)}}}}),void 0)},categories:function(e){var t=this,n=[];t.transaction("categories",function(t){var o=t.objectStore("categories");o.openCursor().onsuccess=function(t){var o=t.target.result;return o?(n.push(o.value),o.continue(),void 0):e(n)}})},deleteDB:function(e){var t=this.indexedDB.deleteDatabase(this.name);t.onsuccess=function(){e&&e()},t.onerror=function(){console.log("Couldn't delete database")},t.onblocked=function(){console.log("Couldn't delete database due to the operation being blocked")}},merge:function(e,t){var n={};for(var o in e)n[o]=e[o];for(var a in t)n[a]=t[a];return n}}}(),function(){todoDatabase.init()}();