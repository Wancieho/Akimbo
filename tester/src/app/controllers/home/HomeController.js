(function (Akimbo) {
	Akimbo.App.Controllers.HomeController = HomeController;

	function HomeController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/home/home.html'
		};

		this.constructor = function (scope) {
			scope.router = new Akimbo.Router();
			scope.cache = new Akimbo.Cache();
		};

		this.before = function (scope) {
			events(scope);

			scope.cache.set('store', 'Hello World');
		};
	}

	function events(scope) {
		$('[data-content] [href="cache"]').on('click', function () {
			scope.router.navigate('cache');
		});
	}
})(akimbo);