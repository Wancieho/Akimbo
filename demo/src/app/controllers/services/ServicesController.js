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

		this.listeners = function (scope) {
			scope.locationService.listen('index.done', function (data) {
				$('[data-content] div').html(JSON.stringify(data));
			}, scope.instance);
		};

		this.init = function (scope) {
			scope.locationService.index({object: scope.instance});
		};
	}
})(akimbo, jQuery);