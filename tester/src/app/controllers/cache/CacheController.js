(function (akimbo) {
	akimbo.App.Controllers.CacheController = CacheController;

	function CacheController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/cache/cache.html'
		};
	}
})(akimbo);