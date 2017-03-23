(function (Akimbo) {
	Akimbo.App.Services.LocationService = LocationService;

	function LocationService() {
		this.name = 'LocationService';
		this.uri = '';
		this.serviceUrl = 'https://freegeoip.net/json/';
	}

	LocationService.prototype = new Akimbo.Service();

	//override Akimbo.Service.index()
	LocationService.prototype.index = function (params, object, overrideEvents) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);

		this.listeners.index = $.ajax({
			url: scope.serviceUrl,
			type: 'GET',
			beforeSend: function () {}
		}).done(function (response) {
			scope.event.broadcast(events.index.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.index.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.index.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};
})(akimbo);