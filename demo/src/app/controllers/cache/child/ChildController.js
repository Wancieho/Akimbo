(function (Akimbo, $) {
	Akimbo.App.Controllers.Cache = {};
	Akimbo.App.Controllers.Cache.ChildController = ChildController;

	function ChildController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/cache/child/child.html'
		};

		this.constructor = function (scope) {
			scope.cache = new Akimbo.Cache();
		};

		this.init = function (scope) {
			$('[data-content] p span').text(scope.cache.get('helloWorld') !== null ? scope.cache.get('helloWorld') : '');
		};
	}
})(akimbo, jQuery);