//#TODO!: remove unnecessary jQuery?
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
		new Akimbo.Main();
	};
})(akimbo);

/*
 * Entry point
 */
(function (Akimbo) {
	Akimbo.Main = Main;

	var instance = null;

	function Main() {
		//#TODO!: re-add anchor back if pushState not supported
		if (history.pushState === undefined) {
			alert('history.pushState() not supported.');
		}

		if (instance === null && window.runningTests !== true) {
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
		instance.router.navigate(window.location.protocol.indexOf('http') !== -1 ? window.location.pathname.replace('/', '') : '');
	}
})(akimbo);