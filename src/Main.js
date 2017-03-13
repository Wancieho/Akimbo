//#TODO: create checks to make sure all dependancies exist on startup eg. env.js
//#TODO: also destroy things like Cache and Events when root # is loaded
//#TODO!: remove all jQuery

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (root) {
	root.Akimbo = {};
	root.App = {};
	root.App.Pages = {};
	root.App.Components = {};
	root.App.Services = {};
	root.App.Classes = {};
	root.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new root.Akimbo.Main();
		}
	};
})(this);

/*
 * Initialisation
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