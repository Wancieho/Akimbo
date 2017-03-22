//#TODO!: remove unnecessary jQuery?
;
'use strict';

var akimbo = {};

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (akimbo) {
	akimbo.App = {};
	akimbo.App.Services = {};
	akimbo.App.Components = {};
	akimbo.App.Controllers = {};
	akimbo.App.Classes = {};
	akimbo.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new akimbo.Main();
		}
	};
})(akimbo);

/*
 * Entry point
 */
(function (akimbo) {
	akimbo.Main = Main;

	var instance = null;

	function Main() {
		//#TODO!: re-add anchor back if pushState not supported
		if (history.pushState === undefined) {
			//#TODO: rather write to document?
			alert('history.pushState() not supported.');
		}

		if (instance === null) {
			instance = this;
			instance.router = new akimbo.Router();

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