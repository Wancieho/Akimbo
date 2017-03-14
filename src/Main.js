//#TODO!: remove all jQuery
//#TODO: convert hashes to uses history.pushstate for better URIs, BUT will this work as file:// standalone?

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (root) {
	root.Akimbo = {};
	root.App = {};
	root.App.Services = {};
	root.App.Components = {};
	root.App.Controllers = {};
	root.App.Classes = {};
	root.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new root.Akimbo.Main();
		}
	};
})(this);

/*
 * Entry point
 */
(function (root) {
	root.Akimbo.Main = Main;

	var instance = null;

	function Main() {
		if (instance === null) {
			instance = this;
			this.router = new root.Akimbo.Router();

			loadRoute(this);
		}
	}

	function loadRoute(scope) {
		var route = '';

		//refresh (F5 etc.) loads current hash
		if (window.location.hash !== '') {
			route = window.location.hash.replace('#', '');
		}

		scope.router.navigate(route);
	}
})(this);