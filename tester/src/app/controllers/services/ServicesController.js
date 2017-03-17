(function (akimbo) {
	akimbo.App.Controllers.ServicesController = ServicesController;

	function ServicesController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/services/services.html'
		};

		this.constructor = function (scope) {
			scope.locationService = new akimbo.App.Services.LocationService();
		};

		this.before = function (scope) {
			$('[data-content]').append('<p>Calling 3rd party location detection service...</p>');

			scope.locationService.listen('read.done', function (data) {
				$('[data-content]').append(JSON.stringify(data));
			}, scope);

			scope.locationService.read(scope);
		};
	}
})(akimbo);