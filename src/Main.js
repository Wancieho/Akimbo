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
			this.router = new akimbo.Router();

			loadRoute(this);
		}
	}

	function loadRoute(scope) {
		var route = '';

		//refresh (F5 etc.) loads current hash
		if (history.pushState !== undefined) {
			if (window.location.protocol === 'http:') {
				route = location.pathname.replace('/', '');
				console.debug(route);
			} else {
				route = '';
				console.debug('else');
				console.debug(location.pathname);
			}

			history.pushState({page: route}, null, location.pathname);
		}

		scope.router.navigate(route);
	}
})(akimbo);