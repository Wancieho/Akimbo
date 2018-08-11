(function (Akimbo) {
	Akimbo.App.Services.LocationService = LocationService;

	function LocationService() {
		this.name = 'LocationService';
		this.uri = '';
		this.serviceUrl = 'https://freegeoip.net/json/';
	}

	LocationService.prototype = new Akimbo.Service();

	//override Akimbo.Service.index()
	LocationService.prototype.index = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.index = $.ajax({
			url: scope.serviceUrl,
			type: 'GET',
			beforeSend: function () {}
		}).done(function (response) {
			scope.event.broadcast(events.index.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.index.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.index.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		});
	};
})(akimbo);