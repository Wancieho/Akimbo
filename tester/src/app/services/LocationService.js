(function (akimbo) {
	akimbo.App.Services.LocationService = LocationService;

	function LocationService() {}

	LocationService.prototype = new akimbo.Service({
		name: 'LocationService',
		uri: '',
		serviceUrl: 'https://freegeoip.net/json/'
	});

	LocationService.prototype.read = function (object) {
		var scope = this;

		this.listeners.read = $.ajax({
			url: scope.serviceUrl,
			type: 'GET',
			beforeSend: function () {}
		}).done(function (response) {
			scope.event.broadcast(scope.events.read.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(scope.events.read.fail, xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(scope.events.read.complete, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};
})(akimbo);