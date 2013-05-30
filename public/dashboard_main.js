$.ajaxSetup({'async' : false});
$.getScript('ProjectList.js');
$.getScript('StorageLocal.js');
$.getScript('Burndown.js');
$.getScript('Velocity.js');
$.getScript('Issue.js');
$.getScript('Story.js');
$.getScript('Defect.js');
$.getScript('Iterator.js');
$.getScript('js/bootstrap.min.js');
$.ajaxSetup({'async' : true});

var DAY = 86400000;  // milliseconds per day
var WEEK = 7 * DAY;  // milliseconds per week
var WAIT = 200;      // milliseconds to wait before processing

var tabList = new Array( ['dash', 'Dashboard'], ['defects', 'Defects'], ['stories', 'Stories'],
						 ['cycleTab', 'Cycle Time'], ['zoomTab', ''], ['options', 'Options'] );

   
function loadDashboard() {
  loadV1Data();
  initPageData();
  
  buildPage();
}

var PROJECT = {};
var ITERATOR = {};
function initPageData() {
  PROJECT = new ProjectList();  
  PROJECT.setURL();
  
//  ;
  
//  ITERATOR.computeAll(null, null);
}

function buildPage() {
  buildProjectList();
  
  var mainDiv = buildNav();
  buildMainLayout(mainDiv);
  buildStoryLayout();
  buildDefectLayout();
  buildCycleLayout();
  buildOptionsLayout();
}

$('#tabs').tab();

function processCompute() {
  var store = new StorageLocal();
  var burn = new Burndown();
  var velocity = new Velocity();
  var issue = new Issue();
  var story = new Story();
  var defect = new Defect();
  
//  ITERATOR = new Iterator();
  ITERATOR = new Iterator(PROJECT.findSchedule());
  ITERATOR.computeAll();
  
  PROJECT.setCurrent('');
  store.setValue(PROJECT.getID(), PROJECT.getCurrent());
  
  document.getElementById(burn.getType()).innerHTML = "Loading Burndown data.....";
  burn.computeAll(ITERATOR, null);
  ITERATOR.reset();

  document.getElementById(velocity.getType()).innerHTML = "Loading Velocity data.....";
  velocity.computeAll(ITERATOR, null);
  
//  document.getElementById(impact.getType()).innerHTML = "Loading Story Impact data.....";
  
//  document.getElementById(cycle.getType()).innerHTML = "Loading Cycle Time data.....";
  
  document.getElementById(issue.getType()).innerHTML = "No Issues yet.....";
  issue.updateURL();
  issue.computeAll(null, null);
  
  document.getElementById(story.getType()).innerHTML = "No Stories yet.....";
  story.updateURL();
  story.computeAll(null, null);
  
  document.getElementById(defect.getType()).innerHTML = "No Defects yet.....";
  defect.updateURL();
  defect.computeAll(null, null);
  
  document.getElementById('loadData').innerHTML = 'Refresh';
  
  return false;
}

function buildProjectList() {
  var form = elementCreate('form', 'projectData', 'projectData');
  var select = elementCreate('select', 'project', 'projectName');
  var compute = buttonCreate('Compute', 'btn btn-primary', 'loadData', processCompute);
  
  form.appendChild(select);
  form.appendChild(compute);
  document.body.appendChild(form);
  
  PROJECT.compute(PROJECT.getURL(), null);
}

function buildNav() {
  var div = divCreate('tabbable');
  var first = navCreate(tabList, div);
  document.body.appendChild(div);
  
  return first; 
}
	
function buildMainLayout(mainDiv) {
  var row1 = divCreate('row-fluid');
  var col1 = divCreate('span8');
  col1.appendChild(chartCreate('Issues and dependencies', 'issueList', 'issueLegend',  'issueData'));
  var col2 = divCreate('span4');
  col2.appendChild(statusCreate('status', 'statusText'));
  row1.appendChild(col1);
  row1.appendChild(col2);
  mainDiv.appendChild(row1);
  
  var row2 = divCreate('row-fluid');
  col1 = divCreate('span8');
  col1.appendChild(chartCreate('Burndown', 'mainChart', 'burndownLegend',  'burndown'));
  col2 = divCreate('span4');
  var top = divCreate('row-fluid');
  var sub1 = divCreate('span12');
  var bottom = divCreate('row-fluid');
  var sub2 = divCreate('span12');
  sub1.appendChild(chartCreate('Story Impact', 'smallChart', 'impactLegend',  'impact'));
  sub2.appendChild(chartCreate('Velocity', 'smallChart', 'velocityLegend',  'velocity'));
  top.appendChild(sub1);
  col2.appendChild(top);
  bottom.appendChild(sub2);
  col2.appendChild(bottom);
  row2.appendChild(col1);
  row2.appendChild(col2);
  mainDiv.appendChild(row2);
  
  var row3 = divCreate('row-fluid');
  col1 = divCreate('span4');
  col1.appendChild(chartCreate('Cycle Time', 'smallChart', 'cycleLegend',  'cycle'));
  col2 = divCreate('span4');
  col2.appendChild(chartCreate('Resource Use', 'smallChart', 'resourceLegend',  'resource'));
  var col3 = divCreate('span4');
  col3.appendChild(chartCreate('Defect Aging', 'smallChart', 'defectLegend',  'aging'));
  row3.appendChild(col1);
  row3.appendChild(col2);
  row3.appendChild(col3);
  mainDiv.appendChild(row3);
}

function buildStoryLayout() {
  var elem = document.getElementById('stories');
  var field = fieldCreate('fullPage');
  var legend = legendCreate('V1 Stories', '', 'storyLegend');
  
  field.appendChild(legend);
  field.appendChild(divCreate('fullPage', 'storyData'));
  elem.appendChild(field);
}

function buildDefectLayout() {
  var elem = document.getElementById('defects');
  var field = fieldCreate('fullPage');
  var legend = legendCreate('V1 Defects', '', 'bugLegend');
  
  field.appendChild(legend);
  field.appendChild(divCreate('fullPage', 'bugData'));
  elem.appendChild(field);
}

function buildCycleLayout() {
}

function buildOptionsLayout(){
}

// HTML component convenience functions
//
function elementCreate(typeStr, classStr, idStr, nameStr) {
  var result = document.createElement(typeStr);
  
  if ((classStr != undefined) && (classStr != '')) result.setAttribute('class', classStr);
  if ((idStr != undefined) && (idStr != '')) result.setAttribute('id', idStr);
  if ((nameStr != undefined) && (nameStr != '')) result.appendChild(document.createTextNode(nameStr));
  
  return result;
}

function statusCreate(divID, pID) {
  var div = divCreate('', divID);
  
  div.appendChild(pCreate('', pID));
  
  return div;
}

function pCreate(classStr, idStr) {
  return elementCreate('p', classStr, idStr);
}

function divCreate(classStr, idStr) {
  return elementCreate('div', classStr, idStr);
}

function fieldCreate(classStr, idStr) {
  return elementCreate('fieldset', classStr, idStr);
}

function chartCreate(name, fieldClass, legendID, divID) {
  var chart = fieldCreate(fieldClass);
  var legend = legendCreate(name, '', legendID);
  
  chart.appendChild(legend);
  chart.appendChild(divCreate(fieldClass, divID));
  
  return chart;
}

function legendCreate(name, classStr, idStr) {
  var legend = elementCreate('legend', classStr, idStr);
  legend.appendChild(document.createTextNode(name));

  return legend;
}


function buttonCreate(name, classStr, idStr, callBack) {

  var result = elementCreate('button', classStr, idStr);
  
  result.onclick = callBack;
  
  result.appendChild(document.createTextNode(name));
  
  return result;
}


function navCreate(list, location) {
  var nav = elementCreate('ul', 'nav nav-pills', 'tabs');
  var panes = divCreate('tab-content');
  var active = 'active';
  var tabPane = 'tab-pane active';
  var firstTab;
    
  for (var incr = 0; incr < list.length; incr++) {
    var option = elementCreate('li', active);
    option.appendChild(linkCreate(list[incr][1], '#'+list[incr][0], 'data-toggle', 'tab'));
	nav.appendChild(option);
	
	var tab = divCreate(tabPane, list[incr][0]);
	if (incr == 0) firstTab = tab;
	panes.appendChild(tab);

	active = '';
	tabPane = 'tab-pane';
  }
  location.appendChild(nav);
  location.appendChild(panes);
	
  return firstTab;
}

function linkCreate(name, href, modifer, value, title) {
  var link = elementCreate('a');

  if (modifer != undefined) link.setAttribute(modifer, value);

  link.appendChild(document.createTextNode(name));
  link.href = href;
  if ((title != undefined) && (title != '')) link.title = title;

  return link;
}

