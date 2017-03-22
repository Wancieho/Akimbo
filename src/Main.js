//#TODO!: remove all jQuery
//#TODO: convert hashes to uses history.pushstate for better URIs, BUT will this work as file:// standalone?

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
		if (instance === null) {
			instance = this;
			instance.router = new akimbo.Router();

			window.onpopstate = function () {
				loadRoute();
			};

			loadRoute();
		}
	}

	function loadRoute() {
		var route = '';

		//refresh (F5 etc.) loads current hash
		if (history.pushState !== undefined) {
			if (window.location.protocol === 'http:') {
				route = window.location.pathname.replace('/', '');
			} else {
				route = '';
			}
console.debug(route);
//			history.pushState({page: route}, null, window.location.pathname);
		}

		instance.router.navigate(route);
	}
})(akimbo);