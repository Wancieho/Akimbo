(function (Akimbo) {
	Akimbo.App.Components.HeaderComponent = HeaderComponent;

	function HeaderComponent() {
		this.meta = {
			selector: 'data-header',
			templateUrl: 'src/app/components/header/header.html'
		};

		this.constructor = function (scope) {
			scope.router = new Akimbo.Router();
		};

		this.before = function (scope) {
			$('[data-header] [name="home"]').on('click', function () {
				scope.router.navigate('');
			});

			$('[data-header] [name="services"]').on('click', function () {
				scope.router.navigate('services');
			});

			$('[data-header] [name="events"]').on('click', function () {
				scope.router.navigate('events');
			});

			$('[data-header] [name="cache"]').on('click', function () {
				scope.router.navigate('cache');
			});
		};
	}
})(akimbo);