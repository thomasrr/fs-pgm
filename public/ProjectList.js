$.ajaxSetup({'async' :false});
$.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' :true});

function ProjectList() {
  ProcessV1Data.call(this);
  this.list = new Array();
  this.type = 'ProjList';
  this.elemID = 'projectName';
  this.current = '';
  this.url = '';
}

ProjectList.prototype = new ProcessV1Data();
ProjectList.prototype.constructor = ProjectList;

var store = new StorageLocal();

ProjectList.prototype.prepareResults = function(results, data) {
	var item = {};
	var today = new Date();
	var todayStr = today.toJSON().slice(10);
	
    for (var incr = 0; incr < results.total; incr++) { 
	  item = { name: results.Assets[incr].Attributes.Name.value,
	           schedule: results.Assets[incr].Attributes["Schedule.Name"].value,
			   begin: results.Assets[incr].Attributes.BeginDate.value,
			   end: results.Assets[incr].Attributes.EndDate.value,
			   id: results.Assets[incr].id.slice(6) };
	  if (item.schedule != null) {
	    if (item.end == null) item.end = todayStr;
	    this.push(item);
	  }
	}
	this.sort();

	document.getElementById(this.elemID).innerHTML = this.toString();
	store.getValue(this.elemID, setProjectName, this);
}

function setProjectName(value, self) {
  self.setCurrent(value);
}

ProjectList.prototype.getID = function() {
  return this.elemID;
}

ProjectList.prototype.sort = function() {   // sort list of projects on name
  this.list.sort(function(a,b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; }); 
}

ProjectList.prototype.push = function(item) {
  this.list.push(item);
}

ProjectList.prototype.getURL = function(item) {
  return this.url;
}

ProjectList.prototype.setURL = function() {
  this.url = getV1URL(this.type, '');
}

ProjectList.prototype.toString = function() {
  	var optList = "<option> </option>";
	
	for (var incr = 0; incr < this.list.length; incr++) {
	  optList += "<option>" + this.list[incr].name + "</option>";
	}
	
	return optList;
}

ProjectList.prototype.setCurrent = function(name) {
  if (name == '') {
    name = document.getElementById(this.elemID).value;
  }
  else {
    document.getElementById(this.elemID).value = name;
  }
  
  this.current = name;
}

ProjectList.prototype.getCurrent = function() {
  return this.current;
}

ProjectList.prototype.findSchedule = function() {
  var result = '';
  
  for (var incr in this.list) {
    if (this.list[incr].name == this.current) {
	  result = this.list[incr].schedule;
	  break;
	}
  }
  return result;
}

ProjectList.prototype.findID = function() {
  var result = '';
  
  for (var incr in this.list) {
    if (this.list[incr].name == this.current) {
	  result = this.list[incr].id;
	  break;
	}
  }
  return result;
}

ProjectList.prototype.findStartDate = function() {
  var result = new Date();
  
  for (var incr in this.list) {
    if (this.list[incr].name == this.current) {
	  result = convertDate(this.list[incr].begin);
	  break;
	}
  }
  return result;
}

ProjectList.prototype.findEndDate = function() {
  var result = new Date();
  
  for (var incr in this.list) {
    if (this.list[incr].name == this.current) {
	  result = convertDate(this.list[incr].end);
	  break;
	}
  }
  return result;
}

ProjectList.prototype.computeEndDate = function() {   // last date to compute
  var last = this.findEndDate();
  var today = createV1Date(0);

  return (last < today) ? last : today;  // for old projects that are no longer active
}
