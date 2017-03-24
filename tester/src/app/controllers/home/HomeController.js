(function (Akimbo) {
	Akimbo.App.Controllers.HomeController = HomeController;

	function HomeController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/home/home.html'
		};

		this.constructor = function (scope) {
			scope.router = new Akimbo.Router();
		};

		this.before = function (scope) {
			events(scope);
		};
	}

	function events(scope) {
		$('[data-content] [name="events"]').on('click', function () {
			scope.router.navigate('events');
		});
	}
})(akimbo);