/*
 # Deep Cloning Objects and Arrays with Func
 A Javascript function that deep clones objects and arrays and calls a function
 on an element that is not an array, set, or map.
 ─────────────────────────────────────────────────────────────────────────────
 Author: seto89
 Date: 2019-11-10
 Version: 1.0.0 (based on deepclone.js 1.0.2)
 Repo: https://github.com/seto89/js-functions
 License: MIT
 ─────────────────────────────────────────────────────────────────────────────
 Polyfill for Object.assign:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
*/

function deepCloneFunc(obj, func) {
	if (typeofObject(func) !== "[object Function]") {
    func = function(obj) { return obj }
  }
  function typeofObject(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isArray(obj) {
    return typeofObject(obj) === "[object Array]";
  }
  function isHash(obj) {
    return typeofObject(obj) === "[object Object]";
  }
  function isMap(obj) {
    return typeofObject(obj) === "[object Map]"
  }
  function isSet(obj) {
    return typeofObject(obj) === "[object Set]"
  }
  function arrayShallowClone(obj) {
    return obj.slice(0);
  }
  function hashShallowClone(obj) {
    return Object.assign({}, obj);
  }

  var newObj;
  var set = false;
  var map = false;
  // Is this a set or a map?
  if (isSet(obj) || isMap(obj)) {
    newObj = [];
    // Convert the set into an array
    if (isSet(obj)) {
      obj.forEach(function (value) { return newObj.push(value) });
      set = true;
    }
    if (isMap(obj)) {
      obj.forEach(function (value, key) { return newObj.push([key, value]) });
      map = true;
    }
    obj = arrayShallowClone(newObj);
  }
  // Is this an array or a hash table?
  if (isArray(obj) || isHash(obj)) {
    // Is this an array?
    if (isArray(obj)) {
      // Shallow clone the array
      newObj = arrayShallowClone(obj);
      // Loop through newObj's elements
      for (var i = 0; i < newObj.length; i++) {
        newObj[i] = deepCloneFunc(newObj[i], func);
      }
    }
    // Is this a hash?
    else {
      // Shallow clone the hash object
      newObj = hashShallowClone(obj);
      // Loop through newObj's properties
      for (var prop in newObj) {
        newObj[prop] = deepCloneFunc(newObj[prop], func);
      }
    }
    // Did this object begin as either a set or a map?
    if (set || map) {
      // Convert it back into a set
      if (set) { newObj = new Set(newObj.slice(0)); }
      // Convert it back into a map
      if (map) { newObj = new Map(newObj.slice(0)); }
    }
    return newObj;
  }
  // Is this something other than an array or hash?
  else {
    return func(obj);
  }
}
