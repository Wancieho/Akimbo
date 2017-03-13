(function (root) {
	root.App.Pages.AboutPage = AboutPage;

	function AboutPage() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/pages/about/about.html'
		};
	}
})(this);