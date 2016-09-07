var merge = require('merge');


var setup = function(config){
	console.log('setup');

	var defaultConfig = {
		width: 1024,
		height: 768,
		importDatabaseFilename: 'SS_test.sql',
		buildTasks: [] // array of string task name (dev/tasks/X)
	}
	var mergedConfig = merge({}, defaultConfig, config);

	browser.driver.manage().window().setSize(mergedConfig.width, mergedConfig.height);

	var syncBefore = browser.ignoreSynchronization;
	browser.ignoreSynchronization = true;

	// clean up old test sessions
	var cleanUrl = browser.params.baseUrl +'dev/tests/cleanupdb';
	browser.driver.get(cleanUrl, 30);

	// start test session
	var startUrl = browser.params.baseUrl + 'dev/testsession/start?createDatabase=1&requireDefaultRecords=1&importDatabaseFilename='+mergedConfig.importDatabaseFilename;

	browser.driver.get(startUrl, 20);
	browser.driver.wait(function() {
		return browser.driver.isElementPresent(by.id('end-session'));
	}, 30000);

	// Build Tasks
	for(var i in mergedConfig.buildTasks){
		var buildTaskName = mergedConfig.buildTasks[i];
		var taskUrl = browser.params.baseUrl + 'dev/tasks/' + buildTaskName;
		browser.driver.get(taskUrl);
		browser.driver.wait(function() {
			return browser.driver.isElementPresent(by.css('h1'));
		}, 30000);
	}

	browser.ignoreSynchronization = syncBefore;

	console.log('setup complete');
};

var teardown = function(){
	console.log('teardown');
	var syncBefore = browser.ignoreSynchronization;
	browser.ignoreSynchronization = true;

	// end test session
	browser.driver.get(browser.params.baseUrl + 'dev/testsession/end');

	browser.ignoreSynchronization = syncBefore;
};






/**
 * @return promise
 */
var _ajaxGet = function(url){
	/*
	 * Pass a string to the browser to be executed.
	 *
	 * We have to use the current browser (rather than e.g. calling from this CLI process) due
	 * to the fact that testsession is session-based.
	 *
	 * See: http://angular.github.io/protractor/#/api?view=webdriver.WebDriver.prototype.executeAsyncScript
	 */
	console.log('GET: '+url);
	var f = 'console.log("ASYNC YO"); '+
		'var callback = arguments[arguments.length - 1]; '+
		'var xhr = new XMLHttpRequest(); '+
		'xhr.open("GET", "'+url+'", true); '+
		'xhr.onreadystatechange = function(){ '+
		'	if(xhr.readyState == 4){ '+
		'		callback(xhr.responseText); '+
		'	} '+
		'}; '+
		'xhr.send("");';
	return browser.executeAsyncScript(f);
};


/*
 * Request modification helpers
 */

/**
 * @return promise
 */
var startServerError = function(){
	return _ajaxGet(browser.params.baseUrl + 'dev/testsession/set?responseOverrideEnabled=1');
};
/**
 * @return promise
 */
var endServerError = function(){
	return _ajaxGet(browser.params.baseUrl + 'dev/testsession/set?responseOverrideEnabled=0');
};


module.exports = {
	setup: setup,
	teardown: teardown,
	startServerError: startServerError,
	endServerError: endServerError
};