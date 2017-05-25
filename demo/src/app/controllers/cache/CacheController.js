(function (Akimbo, $) {
	Akimbo.App.Controllers.CacheController = CacheController;

	function CacheController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/cache/cache.html'
		};

		this.constructor = function (scope) {
			scope.cache = new Akimbo.Cache();
		};

		this.init = function (scope) {
			$('[data-content] p span').text(scope.cache.get('helloWorld') !== null ? scope.cache.get('helloWorld') : '');
		};
	}
})(akimbo, jQuery);