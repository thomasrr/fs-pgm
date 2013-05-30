//var DBBASE = 'http://fs-pgm-dashboard.herokuapp.com/';
var DBBASE = '/';
var DBURL = 'mongo/';

function StorageDB() {
  this.value = 0;
  this.result = 0;
  this.type = '';
}

StorageDB.prototype.setValue = function(item, value) {
  var urlStr = DBBASE + DBURL + item;
  $.ajax({
    url: urlStr,
	type: 'POST',
	data: {'value':value},
    dataType: 'json',
    success: function(result) {
//	    console.log("StorageDB.setValue: " + JSON.stringify(result));   // Debug json results
	},
    error: function(errorStr) {
	  console.log('Error(StorageDB.setValue): \n' + JSON.stringify(errorStr));
	}
  });
}

StorageDB.prototype.getValue = function(item, callback, data) {
  var urlStr = DBBASE + DBURL + item;
  $.ajax({
    url: urlStr,
	type: 'GET',
    dataType: 'json',
    success: function(result) {
//	  console.log("StorageDB.getValue: " + JSON.stringify(result));   // Debug json results
	  callback(result.value, data);
	},
	error: function(errorStr) {
	  console.log("Error(StorageDB.getValue): \n" + JSON.stringify(errorStr));
    }
  });
}

StorageDB.prototype.clear = function(item) {
  var urlStr = DBBASE + DBURL + item;
  $.ajax({
    url: urlStr,
	type: 'DELETE',
    dataType: 'json',
    success: function(result) {
//	  console.log("StorageDB.clear: " + JSON.stringify(result));   // Debug json result
	},
	error: function(errorStr) {
	  console.log("Error(StorageDB.clear): \n" + JSON.stringify(errorStr));
	}
  });
}

