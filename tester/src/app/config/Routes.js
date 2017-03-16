(function (akimbo) {
	akimbo.App.Config.routes = [
		{
			path: '',
			controller: 'HomeController'
		},
		{
			path: 'services',
			controller: 'ServicesController'
		},
		{
			path: 'events',
			controller: 'EventsController'
		},
		{
			path: 'cache',
			controller: 'CacheController'
		}
	];
})(akimbo);