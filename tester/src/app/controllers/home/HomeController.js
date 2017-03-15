(function (root) {
	root.App.Controllers.HomeController = HomeController;

	function HomeController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/home/home.html'
		};
	}
})(protected);