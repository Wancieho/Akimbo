(function (Akimbo, $) {
	Akimbo.App.Controllers.ServicesController = ServicesController;

	function ServicesController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/services/services.html'
		};

		this.constructor = function (scope) {
			scope.apiService = new Akimbo.App.Services.ApiService();
			scope.locationService = new Akimbo.App.Services.LocationService();
		};

		this.before = function (scope) {
			api(scope);
			location(scope);
		};
	}

	function api(scope) {
		$('[data-content]').append('<p id="api">Calling 3rd party RESTful API...</p>');

		scope.apiService.listen('index.done', function (data) {
			$('#api').hide();

			$('[data-content]').append('<p>' + JSON.stringify(data) + '</p>');
		}, scope.meta);

		scope.apiService.index(null, scope.meta);
	}

	function location(scope) {
		$('[data-content]').append('<p id="location">Calling 3rd party location detection service...</p>');

		scope.locationService.listen('index.done', function (data) {
			$('#location').hide();

			$('[data-content]').append('<p>' + JSON.stringify(data) + '</p>');
		}, scope.meta);

		scope.locationService.index(null, scope.meta);
	}
})(akimbo, jQuery);