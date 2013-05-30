$.ajaxSetup({'async' :false});
$.getScript('StorageLocal.js');
$.ajaxSetup({'async' :true});

var V1ACTIVE = '"64"';
var V1CLOSED = '"128"';
var V1BASE = 'https://www5.v1host.com/FH-V1/';
var V1REST = V1BASE + 'rest-1.v1/'
var V1BASEURL = V1REST + 'Data/';
var V1HISTURL = V1REST + 'Hist/';

function createV1Date(date) {
  var result = (date == 0) ? new Date() : new Date(date);
  result.setHours(23, 59, 59, 0);   // all dates are for 12:59:59.00 PM
  
  return result;
}

function getV1DateObj(url) {  // expects input like (==url==)&asof="2013-01-31:23:59:59.00"
   var str = url.substr(url.search('asof')+5, 10);
   
   return convertDate(str);
}

function orderV1Data(data) {
  var orderedBurnData = new Array();

  data.sort(function(a,b) { return a[0] - b[0]; });  // sort array on first value (dates)
  
  var lastDate = 0;
  for (var incr = 0; incr < data.length; incr++) {
    if (data[incr][0] == lastDate) {
	  orderedBurnData[orderedBurnData.length-1][1] += data[incr][1];  // add Story and Defect data
	}
	else {
	  lastDate = data[incr][0];
	  orderedBurnData.push([data[incr][0], data[incr][1]]);
	}
  }
		  
  return orderedBurnData;
}

var dataV1 = { name:'', pass:'' };
function loadV1Data() {
  var store = new StorageLocal();
  store.getValue('V1user', loadV1auth, null);
}

function loadV1auth(value, data) {
  dataV1.name = value.name;	
  dataV1.pass = value.pass;
}

function getV1Headers() {
  var auth = dataV1.name + ':' + dataV1.pass;
//  console.log ('V1 AUTH: ' + auth);
  var headers = { Authorization: "Basic " + btoa(auth) };
  
  return headers;
}  

function getV1URL(type, projName) {
  var projStr = (projName == "") ? ("\"" + PROJECT.getCurrent() + "\""): projName;
  var JSONSTR = "Accept=application/json";
  var PROJSTR = "where=Scope.Name=" + projStr + ";AssetState=" + V1ACTIVE;
  var PROJSTRC = "where=Scope.Name=" + projStr + ";AssetState=" + V1CLOSED;
  var SCHEDSTR = "where=Schedule.Name=\"" + PROJECT.findSchedule() + "\"";
  var DEFSEL = "sel=CreateDate,Owners,Description,Status,Number,Name";
  var CYCSEL = "sel=Timebox,ChangeDate,Estimate,Status&where=Number=";
  var IMPSEL = "sel=ChangeDate,AssetState,Number,Status&where=Scope.Name=" + projStr;
  var STORSEL = "sel=Estimate,Number,Name,Status,Owners,Description,Custom_AcceptanceCriteria";
  var PROJSEL = "sel=Name,BeginDate,EndDate,Schedule";
  var PROJUP = "where=Scope.ParentMeAndDown='Scope:1'";
  var ITERSEL = "sel=BeginDate,EndDate";
  
  var url = "";
  
  if (type == "Issues") {
    url = V1BASEURL + "Issue?" + JSONSTR + "&" + PROJSTR;
  }
  else if (type == "Defects") {
    url = V1BASEURL + "Defect?" + JSONSTR + "&" + DEFSEL + "&" + PROJSTR;
  }
  else if (type == "Story") {
    url = V1BASEURL + "Story?" + JSONSTR + "&" + STORSEL + "&" + PROJSTR;
  }
  else if (type == "BurnDefect") {
    url = V1HISTURL + "Defect?" + JSONSTR + "&" +  PROJSTR + "&asof=";
  }
  else if (type == "BurnStory") {
    url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTR + "&asof=";
  }
  else if (type == "VeloDefect") {
        url = V1HISTURL + "Defect?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "VeloStory") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "ProjList") {
        url = V1BASEURL + "Scope?" + JSONSTR + "&" + PROJSEL + "&" + "where=AssetState=" + V1ACTIVE;
  }
  else if (type == "CycleList") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  PROJSTRC + "&asof=";
  }
  else if (type == "CycleStory") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" + CYCSEL;
  }
  else if (type == "Impact") {
        url = V1HISTURL + "Story?" + JSONSTR + "&" +  IMPSEL + "&asof=";
  }
  else if (type == "Iteration") {
        url = V1BASEURL + "Timebox?" + JSONSTR + "&" + ITERSEL + "&where=Schedule.Name=";
  }
  
  return url;
}

function getV1Link(oid, text) {
  var link = '<a  target="_blank" href=' + V1BASE;
  
  if (oid.charAt(0) == 'I') {
    link += "Issue";
  }
  else if (oid.charAt(0) == 'D') {
    link += "Defect";
  }
  else if (oid.charAt(0) == 'S') {
    link += "Story";
  }
  link += ".mvc/Summary?oidToken=" + oid + ">" + text + "</a>";
  
  return link;
}
