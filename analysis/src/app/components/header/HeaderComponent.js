(function (root) {
	root.App.Components.HeaderComponent = HeaderComponent;

	function HeaderComponent() {
		this.meta = {
			selector: 'data-header',
			templateUrl: 'src/app/components/header/header.html'
		};

		this.constructor = function (scope) {
			scope.router = new root.Akimbo.Router();
		};

		this.before = function (scope) {
			$('[name="home"]').on('click', function () {
				scope.router.navigate('');
			});

			$('[name="about"]').on('click', function () {
				scope.router.navigate('about');
			});
		};
	}
})(this);