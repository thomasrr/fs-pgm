$.ajaxSetup({'async' : false});
$.getScript('ProcessV1Data.js');
$.ajaxSetup({'async' : true});

function Burndown() {
  ProcessV1Data.call(this);
  this.type = 'burndown';
  this.items = ['BurnStory', 'BurnDefect'];
  this.increment = 1;
}

Burndown.prototype = new ProcessV1Data();
Burndown.prototype.constructor = Burndown;

Burndown.prototype.prepareResults = function(results, data) {  // combine stored data and value 
  var sum = 0;
   
  if (result.Assets.length > 0) {
	for (var incr = 0; incr < result.Assets.length; incr++) {
	  sum += result.Assets[incr].Attributes.Estimate.value;
	}
    this.pushData([data, results]);
  }
}

Burndown.prototype.display = function() {
  var stored = this.getStored();
  var element = this.getDisplay();
/*   
    var stored = getStoredBurnData(projName);
	for (var incr in stored) {
      localData.push([stored[incr][0], stored[incr][1]]);
    }
	compute.setData('burndown', orderV1Data(localData));
	buildBurnChart(compute.getData('burndown'), compute.getData('velocity'), 'burndown');
	setStoredBurnData(projName, compute.getData('burndown'));
 */  
}
