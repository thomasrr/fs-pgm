$.ajaxSetup({'async' :false});
$.getScript('ProcessSimpleV1Data.js');
$.ajaxSetup({'async' :true});

function Issue() {
  ProcessSimpleV1Data.call(this);
  
  this.type = 'issueData';
  this.items = ['Issues'];
  this.increment = 1;
  this.displayAll = false;
  this.class = 'Issue';
}

Issue.prototype = new ProcessSimpleV1Data();
Issue.prototype.constructor = Issue;

Issue.prototype.format = function(full) {
  var issueList = this.getResults();
  var formatted = "<ul>";
  var max = issueList.total;
  
  if (max == 0) {
    formatted = "No Issues at this time!";
  }
  for (var incr = 0; incr < max; incr++) {
    if (issueList.Assets[incr].Attributes["ResolutionReason.Name"].value != "Resolved") {
      formatted += "<li>";
	  formatted += getV1Link (issueList.Assets[incr].id, issueList.Assets[incr].Attributes.Number.value); 
	  formatted += "  " + issueList.Assets[incr].Attributes.Name.value;
	  if (full == true) {
	    formatted += "<ul>{";
		if (issueList.Assets[incr].Attributes.TargetDate.value != null) {
	      formatted += issueList.Assets[incr].Attributes.TargetDate.value;
	    }
	    formatted += "} ";
		formatted += "[";  
	    if (issueList.Assets[incr].Attributes["Owner.Name"].value != null) {
	      formatted += issueList.Assets[incr].Attributes["Owner.Name"].value;
        }
        formatted += "]";
        formatted += "(" + issueList.Assets[incr].Attributes["Category.Name"].value;
        formatted += ")</ul>";
	    
        if (issueList.Assets[incr].Attributes.Description.value != null) {
	      var str = issueList.Assets[incr].Attributes.Description.value;
	      str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	      formatted += "<ul>" + str + "</ul>";
	    }
	  }
	  formatted += "</li>";
    }
  }
  
  return formatted;
}