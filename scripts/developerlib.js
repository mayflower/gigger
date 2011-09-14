/*
* Author: Felix Kaser <felix.kaser@mayflower.de>
*/

//require.js module pattern
define(["jquery", "util", "http://faye.node.vm:8000/faye.js"], function (jquery, util) {

	jquery = $.noConflict(true);
	console.log('developerlib started', 'jquery: ', jquery, '$: ', $);
	console.log('util module: ', util);

	//namespace
	var Gigger = {
		VERSION: "0.1"
	};
	
	// global fayeClient
	var fayeClient;
	
	var registeredCustomJS = [];
	
	// unique ID generator
	var generateUniqueID = function() {
		var d = new Date;
		return d.getTime().toString() + Math.floor(Math.random()*101);
	}
	
	var handleDispatch = function(eventRequest) {
		console.log("dispatch got message:", eventRequest);
		
		var e = eventRequest;
		
		try {
			if (e.path != null) {
				//check if path is valid
				console.log('path', e.path);
				if (e.path != window.location.pathname) {
					console.log('not my event, dropping', e);
					return;
				}
			} else if (e.pathRegex != null){
				//check path regex
				console.log('pathRegex', e.pathRegex);
				if (window.location.pathname.match(e.pathRegex) == null) {
					console.log('not my event, dropping', e);
					return;
				}
			} else {
				throw 'neither path nor pathRegex was specified, dropping eventRequest';
			}
			
			if (e.event != null) {
				// event was specified, must come with element, class or tagName
				var elements;
				if (e.element != null) {
					//lookup element and hook event
					console.log('element', e.element);
					
					// hack to make code more generic
					elements = jquery("#" + e.element);
				} else if (e.class != null) {
					//lookup class and hook event(s)
					console.log('class', e.class);
					
					elements = jquery("." + e.class);
				} else if (e.tagName != null) {
					//lookup tag name and hook event(s)
					console.log('tagName', e.tagName);
					
					elements = jquery(e.tagName);
				} else {
					throw 'events must come with element, class or tagName, dropping eventRequest';
				}
				
				console.log('elements is: ', elements);
				// append event handler to all events
				// remove previously attached events
				// namespace event to prevent conflicts
				var namespacedEvent = e.event + ".gigger";
				elements.die(namespacedEvent);
				elements.live(namespacedEvent, function(event) {
					jquery(document).ready( function() {
						var text = jquery(event.target).text();
						console.log("event callback", event, e.fields, "text is: ", text, "jquery object: ", jquery(event.target));
						
						// fill the requested fields
						function fillFields(currentElement, currentField) {
							for (var fieldname in currentField) {
								if (currentField[fieldname] != null && typeof(currentField[fieldname]) == "object") {
									fillFields(currentElement[fieldname], currentField[fieldname]);
								} else {
									currentField[fieldname] = currentElement[fieldname];
								}
							}
						};
						
						// recursively fill fields
						fillFields(event, e.fields);
						fayeClient.publish(util.getChannelID(e), e);
					});
				});
			} else if (e.customJS != null) {
				//evaluate custom js
				console.log('customJS', e.customJS);
				
				// make sure this gets evaluated only once
				if (jquery.inArray(e.customJS, registeredCustomJS) == -1) {
					registeredCustomJS.push(e.customJS);
					jquery.globalEval(e.customJS);
				}
			} else {
				throw 'neither event nor customJS specified, dropping eventRequest';
			}
		} catch (err) {
			console.error(err, e);
		}
	};

	//Class Gigger
	Gigger.Gigger = function(service) {
		fayeClient = new Faye.Client(service);
		this.client = fayeClient;
		// subscribe to dispatch channel for new eventRequests
		this.dispatch = this.client.subscribe('/dispatch', handleDispatch);
		
		// ask monitoring client if there are already some dispatch Requests open
		var id = '/dispatch/' + generateUniqueID();
		this.dispatchRequest = this.client.subscribe(id, handleDispatch);
		this.client.publish('/dispatchRequest', {uniqueChannelId: id});
	};

	Gigger.Gigger.prototype = {
		/** Call this function to trigger your custom events on a channel. Use only if
		 *  the monitor is registered on that channel.
		 *  @param channel: Channel where the events will be emitted
		 *  @param event: custom event which will be triggered */
		triggerEvent: function(channel, event) {
			console.log(event, 'was triggered manually on ' + channel);
			fayeClient.publish(channel, event);
		},
		stop: function() {
			console.log("stop gigger");
			this.dispatch.cancel();
			this.dispatchRequest.cancel();
		}
	};

	return Gigger;
});
