(function (Akimbo) {
	Akimbo.App.Config.routes = function () {
		return [
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
			},
			{
				path: 'templates',
				controller: 'TemplatesController'
			}
		];
	};
})(akimbo);