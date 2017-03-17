(function (akimbo) {
	akimbo.App.Controllers.EventsController = EventsController;

	function EventsController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/events/events.html'
		};
	}
})(akimbo);