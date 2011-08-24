Ext.require(['Ext.data.*']);

Ext.onReady(function() {
	//create our model
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
	
});
