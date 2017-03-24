(function (Akimbo) {
	Akimbo.App.Controllers.EventsController = EventsController;

	function EventsController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/events/events.html'
		};

		this.constructor = function (scope) {
			scope.event = new Akimbo.Event();
		};

		this.before = function (scope) {
			scope.event.listen('loaded', function () {
				$('[data-content]').append('<p>"loaded" event caught</p>');
			});

			scope.event.broadcast('loaded');
		};
	}
})(akimbo);