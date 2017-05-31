(function (Akimbo) {
	Akimbo.App.Config.routes = function () {
		return [
			{
				path: '',
				controller: Akimbo.App.Controllers.HomeController
			},
			{
				path: 'services',
				controller: Akimbo.App.Controllers.ServicesController
			},
			{
				path: 'events',
				controller: Akimbo.App.Controllers.EventsController
			},
			{
				path: 'cache/child',
				controller: Akimbo.App.Controllers.Cache.ChildController
			},
			{
				path: 'templates',
				controller: Akimbo.App.Controllers.TemplatesController
			}
		];
	};
})(akimbo);