var exec = require('cordova/exec');

var execAsPromise = function (command, args) {
    if (args === void 0) { args = []; }
    return new Promise(function (resolve, reject) {
        window.cordova.exec(resolve, reject, 'FCMPlugin', command, args);
    });
};

var asDisposableListener = function (eventTarget, eventName, callback, options) {
    if (options === void 0) { options = {}; }
    var once = options.once;
    var handler = function (event) { return callback(event.detail); };
    eventTarget.addEventListener(eventName, handler, { passive: true, once: once });
    return {
        dispose: function () { return eventTarget.removeEventListener(eventName, handler); },
    };
};

var bridgeNativeEvents = function (eventTarget) {
    var onError = function (error) { return console.log('FCM: Error listening to native events', error); };
    var onEvent = function (data) {
        try {
            var _a = JSON.parse(data), eventName = _a[0], eventData = _a[1];
            eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: eventData }));
        }
        catch (error) {
            console.log('FCM: Error parsing native event data', error);
        }
    };
    window.cordova.exec(onEvent, onError, 'FCMPlugin', 'startJsEventBridge', []);
};

function FCMPlugin() { 
	console.log("FCMPlugin.js: is created");
}

// SUBSCRIBE TO TOPIC //
FCMPlugin.prototype.subscribeToTopic = function( topic, success, error ){
	exec(success, error, "FCMPlugin", 'subscribeToTopic', [topic]);
}
// UNSUBSCRIBE FROM TOPIC //
FCMPlugin.prototype.unsubscribeFromTopic = function( topic, success, error ){
	exec(success, error, "FCMPlugin", 'unsubscribeFromTopic', [topic]);
}

FCMPlugin.prototype.hasPermission = function () {
	return window.cordova.platformId === 'ios'
		? execAsPromise('hasPermission')
		: execAsPromise('hasPermission').then(function (value) { return !!value; });
};
FCMPlugin.prototype.requestPushPermission = function (options) {
	var _a, _b, _c, _d;
	if (window.cordova.platformId !== 'ios') {
		return Promise.resolve(true);
	}
	var ios9SupportTimeout = (_b = (_a = options === null || options === void 0 ? void 0 : options.ios9Support) === null || _a === void 0 ? void 0 : _a.timeout) !== null && _b !== void 0 ? _b : 10;
	var ios9SupportInterval = (_d = (_c = options === null || options === void 0 ? void 0 : options.ios9Support) === null || _c === void 0 ? void 0 : _c.interval) !== null && _d !== void 0 ? _d : 0.3;
	return execAsPromise('requestPushPermission', [ios9SupportTimeout, ios9SupportInterval]);
};

// NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotification = function( callback, success, error ){
	FCMPlugin.prototype.onNotificationReceived = callback;
	if (window.cordova.platformId !== 'ios') {
		exec(success, error, "FCMPlugin", 'registerNotification',[]);
		return;
	}
	return asDisposableListener(this.eventTarget, 'notification', callback, {});
}
// TOKEN REFRESH CALLBACK //
FCMPlugin.prototype.onTokenRefresh = function( callback ){
	if (window.cordova.platformId !== 'ios') {
		FCMPlugin.prototype.onTokenRefreshReceived = callback;
		return;
	}
	return asDisposableListener(this.eventTarget, 'tokenRefresh', callback, {});
}
// GET TOKEN //
FCMPlugin.prototype.getToken = function( success, error ){
	exec(success, error, "FCMPlugin", 'getToken', []);
}

// DEFAULT NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotificationReceived = function(payload){
	console.log("Received push notification")
	console.log(payload)
}
// DEFAULT TOKEN REFRESH CALLBACK //
FCMPlugin.prototype.onTokenRefreshReceived = function(token){
	console.log("Received token refresh")
	console.log(token)
}
FCMPlugin.prototype.deleteInstanceId = function (success, error) {
	exec(success, error, "FCMPlugin", "deleteInstanceId", []);
}
// FIRE READY //
exec(function(result){ console.log("FCMPlugin Ready OK") }, function(result){ console.log("FCMPlugin Ready ERROR") }, "FCMPlugin",'ready',[]);





var fcmPlugin = new FCMPlugin();
module.exports = fcmPlugin;
