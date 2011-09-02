Ext.require(['Ext.data.*']);

Ext.onReady(function() {
	//create our model for counting clicks
	Ext.define('Events', {
		extend: 'Ext.data.Model',
		/*fields: [
			{path: 'path', type: 'string'},
			{pathRegex: 'pathRegex', type: 'string'},
			{element: 'element', type: 'string'},
			{class: 'class', type: 'string'},
			{tagName: 'tagName', type: 'string'},
			{event: 'event', type: 'string'},
			{customJS: 'customJS', type: 'string'},
			{timeStamp: 'timeStamp', type: 'string'}
		]*/
		fields: [
			{event: 'event', type: 'string'},
			{times: 'times', type: 'int'}
		]
	});

	window.store1 = new Ext.data.Store({
		model: 'Events'
	});
	
	//create model for the heatmap
	
	Ext.define('ClickPos', {
		extend: 'Ext.data.Model',
		/*fields: [
			{path: 'path', type: 'string'},
			{pathRegex: 'pathRegex', type: 'string'},
			{element: 'element', type: 'string'},
			{class: 'class', type: 'string'},
			{tagName: 'tagName', type: 'string'},
			{event: 'event', type: 'string'},
			{customJS: 'customJS', type: 'string'},
			{timeStamp: 'timeStamp', type: 'string'}
		]*/
		fields: [
			{x: 'x', type: 'int'},
			{y: 'y', type: 'int'}
		]
	});

	window.heatStore = new Ext.data.Store({
		model: 'ClickPos'
	});
});
