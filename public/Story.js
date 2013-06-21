$.ajaxSetup({'async' :false});
$.getScript('ProcessSimpleV1Data.js');
$.ajaxSetup({'async' :true});

function Story() {
  ProcessSimpleV1Data.call(this);
  
  this.type = 'storyData';
  this.items = ['Story'];
  this.increment = 1;
  this.displayAll = true;
  this.class = 'Story';
}

Story.prototype = new ProcessSimpleV1Data();
Story.prototype.constructor = Story;

Story.prototype.format = function(full) {
  var storyList = this.getResults();
  var formatted = "";
  var max = storyList.total;
  
  if (max == 0) {
    formatted = "No V1 Stories at this time!";
  }
  else {
    var points = 0;
	for (var incr = 0; incr < max; incr++) {
	  // console.log(JSON.stringify(storyList.Assets[incr], null, 4));
	  if (storyList.Assets[incr].Attributes.Estimate.value != null)
        points += parseInt(storyList.Assets[incr].Attributes.Estimate.value);
	}
    formatted = "There are " + max + " stories representing " + points + " story points";
	if (full == true) formatted += formatAcceptance(storyList,  max);
  }
  formatted += "<ul>";
  for (var incr = 0; incr < max; incr++) {
    formatted += "<li>";

    formatted += getV1Link (storyList.Assets[incr].id, storyList.Assets[incr].Attributes.Number.value) + " "; 
    formatted += "(";
    if (storyList.Assets[incr].Attributes.Estimate.value != null)
      formatted	+= storyList.Assets[incr].Attributes.Estimate.value;
    formatted += ") ";
	formatted += "[";
    if (storyList.Assets[incr].Attributes.Status.value == null) {
	  formatted += "Not yet started";
	}
	else {
	  formatted += storyList.Assets[incr].Attributes["Status.Name"].value;
	}
	if (storyList.Assets[incr].Attributes["Owners.Name"].value != null) {
	    formatted += ";" + storyList.Assets[incr].Attributes["Owners.Name"].value;
	}
	formatted += "] ";
	formatted += storyList.Assets[incr].Attributes.Name.value;
	if (full == true) {
      if (storyList.Assets[incr].Attributes.Description.value != null) {
	    var str = storyList.Assets[incr].Attributes.Description.value;
	    str = str.replace (/<[^>]*>?/gm, '');  // strip HTML
	    formatted += "<ul>" + str + "</ul>";
	  }
	}
	formatted += "</li>";
  }
  
  return formatted;
}

function formatAcceptance (storyList, max) {
  var percent;
  var count = 0;
  var result = "";
  var first = "<li>";
  
  for (var incr = 0; incr < max; incr++) {
	if (storyList.Assets[incr].Attributes.Custom_AcceptanceCriteria.value != null) count += 1;
  }
  percent = 100 - ((count / max) * 100);
  if (percent > 25.00) {
    var color = "FFFF66";
    if (percent > 75.00) {
	  color = "#F26868";
	}
	else if (percent > 50.00) {
	  color = "#F28D09";
	}
    first = '<li style="width:310px;background-color:' + color + '">';
  }
  
  result = first + percent.toFixed(2) + "% stories missing Acceptance Criteria</li>";
  return result;
}

  