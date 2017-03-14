(function (root) {
	root.App.Controllers.AboutController = AboutController;

	function AboutController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/about/about.html'
		};
	}
})(protected);