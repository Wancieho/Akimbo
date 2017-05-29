(function (Akimbo, $) {
	Akimbo.App.Controllers.EventsController = EventsController;

	function EventsController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/events/events.html'
		};

		this.constructor = function (scope) {
			scope.event = new Akimbo.Event();
			scope.cache = new Akimbo.Cache();
		};

		this.listeners = function (scope) {
			scope.event.listen('loaded', function () {
				$('[data-content]').append('<p>"loaded" event caught</p>');
			});

			scope.cache.on('set', function (data) {
				$('[data-content]').append('<p>"cache set" event caught: "' + JSON.stringify(data) + '"</p>');
			});
		};

		this.init = function (scope) {
			scope.event.broadcast('loaded');

			scope.cache.remove();

			scope.cache.set('i', {
				am: 'object'
			});
		};
	}
})(akimbo, jQuery);