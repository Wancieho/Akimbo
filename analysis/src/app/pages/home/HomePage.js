(function (root) {
	root.App.Pages.HomePage = HomePage;

	function HomePage() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/pages/home/home.html'
		};
	}
})(this);