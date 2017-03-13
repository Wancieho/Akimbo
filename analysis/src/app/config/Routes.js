(function (root) {
	root.App.Config.Routes = Routes;

	var routes = [
		{
			path: '',
			page: 'HomePage'
		},
		{
			path: 'about',
			page: 'AboutPage'
		}
	];

	function Routes() {}

	Routes.prototype = {
		get: function () {
			return routes;
		}
	};
})(this);