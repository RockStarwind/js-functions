/*
* # Deep Cloning Objects and Arrays
* A Javascript function that deep clones objects and arrays
* Possibly faster than JSON.parse(JSON.stringify(obj)).
*
* Author: seto89
* Date: 2019-11-10
* Version: 1.0.1
* Repo: https://github.com/seto89/js-functions
* License: MIT

Polyfill for Object.assign:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
*/

function deepClone(obj) {
  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }
  function isHash(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
  function isSet(obj) {
    return Object.prototype.toString.call(obj) === "[object Set]"
  }
  function arrayShallowClone(obj) {
    return obj.slice(0);
  }
  function hashShallowClone(obj) {
    return Object.assign({}, obj);
  }

  var newObj;
  var set = false;
  // Is this a set?
  if (isSet(obj)) {
    // Convert the set into an array
    newObj = [];
    obj.forEach(function (value) { return newObj.push(value) });
    obj = arrayShallowClone(newObj);
    set = true;
  }
  // Is this an array or a hash table?
  if (isArray(obj) || isHash(obj)) {
    // Is this an array?
    if (isArray(obj)) {
      // Shallow clone the array
      newObj = arrayShallowClone(obj);
      // Loop through newObj's elements
      for (var i = 0; i < newObj.length; i++) {
        newObj[i] = deepClone(newObj[i]);
      }
    }
    // Is this a hash?
    else {
      // Shallow clone the hash object
      newObj = hashShallowClone(obj);
      // Loop through newObj's properties
      for (var prop in newObj) {
        newObj[prop] = deepClone(newObj[prop]);
      }
    }
    // Did this object begin as a set?
    if (set) {
      // Convert it back
      newObj = new Set(newObj.slice(0));
    }
    return newObj;
  }
  // Is this something other than an array or hash?
  else {
    return obj;
  }
}
