;
'use strict';

var akimbo = {};

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (Akimbo) {
	Akimbo.App = {};
	Akimbo.App.Services = {};
	Akimbo.App.Components = {};
	Akimbo.App.Controllers = {};
	Akimbo.App.Classes = {};
	Akimbo.App.Config = {};

	Akimbo.start = function () {
		new Akimbo.Init();
	};
})(akimbo);

/*
 * Entry point
 */
(function (Akimbo) {
	Akimbo.Init = Init;

	var instance = null;

	function Init() {
		//#TODO!: re-add anchor back if pushState not supported
		if (history.pushState === undefined) {
			alert('history.pushState() not supported.');
		}

		if (instance === null) {
			instance = this;
			instance.router = new Akimbo.Router();

			window.onpopstate = function () {
				instance.router.ignoreHistory = true;

				navigate();
			};

			navigate();
		}
	}

	function navigate() {
		// load requested route based on URI
		try {
			instance.router.navigate(window.location.protocol.indexOf('http') !== -1 ? window.location.pathname.replace(new Akimbo.Config().get('settings.basePath') !== null ? '/' + new Akimbo.Config().get('settings.basePath') + '/' : '/', '') : '');
		} catch (requestedRouteException) { // requested route does not exists
			// load 404 URI
			try {
				instance.router.navigate('404');
			} catch (notFoundRouteException) { // 404 route does not exist
				throw notFoundRouteException;
			}
		}
	}
})(akimbo);