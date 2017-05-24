(function (Akimbo, $) {
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

		this.events = function (scope) {
			$('[data-content] [href="cache"]').on('click', function () {
				scope.router.navigate('cache');
			});
		};

		this.init = function (scope) {
			scope.cache.set('store', 'Hello World');
		};
	}
})(akimbo, jQuery);