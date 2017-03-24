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
			$('[data-header] a').on('click', function () {
				scope.router.navigate($(this).attr('href'));
			});
		};
	}
})(akimbo);