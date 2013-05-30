$.ajaxSetup({'async' : false});
$.getScript('ProcessSimpleV1Data.js');
$.ajaxSetup({'async' : true});

function Defect() {
  ProcessSimpleV1Data.call(this);
  
  this.type = 'bugData';
  this.items = ['Defects'];
  this.increment = 1;
  this.displayAll = false;
}

Defect.prototype = new ProcessSimpleV1Data();
Defect.prototype.constructor = Defect;

Defect.prototype.format = function(full) {
  var defectList = this.result;
  var formatted = "";
  var max = defectList.total;
  
  if (max == 0) {
    formatted = "No V1 defects at this time!";
  }
  else {
    formatted = "There are " + max + " defects";
  }
  formatted += "<ul>";
  for (var incr = 0; incr < max; incr++) {
    formatted += "<li>";

    formatted += getV1Link (defectList.Assets[incr].id, defectList.Assets[incr].Attributes.Number.value) + " "; 
    formatted += defectList.Assets[incr].Attributes.Name.value;
	if (full == true) {
	  formatted += "<ul>";
	  if (defectList.Assets[incr].Attributes["Status.Name"].value != null) {
	    formatted += defectList.Assets[incr].Attributes["Status.Name"].value;
	  }
	  else {
	    formatted += "Not yet started";
	  }
	  if (defectList.Assets[incr].Attributes["Owners.Name"].value != null) {
	    formatted += " [" + defectList.Assets[incr].Attributes["Owners.Name"].value + "]";;
	  }
	  formatted += "</ul>";
      if (defectList.Assets[incr].Attributes.Description.value != null) {
	    var str = defectList.Assets[incr].Attributes.Description.value;
	    str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	    formatted += "<ul>" + str + "</ul>";
	  }
	}
	formatted += "</li>";
  }
  
  return formatted;
}