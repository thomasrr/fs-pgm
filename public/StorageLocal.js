
function StorageLocal() {
}

StorageLocal.prototype.setValue = function(item, value) {
  if (window.localStorage) {
    try {
	  window.localStorage.setItem(item, value);
	}
	catch (error) {
	  console.log (error);
	}
  }
}

StorageLocal.prototype.getValue = function(item, callback, data) {
  var result = ''; 
  
  if (window.localStorage) {
    result = window.localStorage.getItem(item);
	if (result) callback(result, data);
  }
}

StorageLocal.prototype.clear = function() {
  if (window.localStorage) window.localStorage.clear();
}

