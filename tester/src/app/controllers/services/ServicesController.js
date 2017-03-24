(function (Akimbo, $) {
	Akimbo.App.Controllers.ServicesController = ServicesController;

	function ServicesController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/services/services.html'
		};

		this.constructor = function (scope) {
			scope.locationService = new Akimbo.App.Services.LocationService();
		};

		this.before = function (scope) {
			location(scope);
		};
	}

	function location(scope) {
		scope.locationService.listen('index.done', function (data) {
			$('[data-content] div').html(JSON.stringify(data));
		}, scope.meta);

		scope.locationService.index(null, scope.meta);
	}
})(akimbo, jQuery);