(function (root) {
	root.App.Config.Routes = Routes;

	var routes = [
		{
			path: '',
			controller: 'HomeController'
		},
		{
			path: 'about',
			controller: 'AboutController'
		}
	];

	function Routes() {}

	Routes.prototype = {
		get: function () {
			return routes;
		}
	};
})(this);