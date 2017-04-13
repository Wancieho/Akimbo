(function (Akimbo) {
	Akimbo.App.Controllers.TemplatesController = TemplatesController;

	function TemplatesController() {
		this.meta = {
			selector: 'data-content',
			templateUrl: 'src/app/controllers/templates/templates.html'
		};

		this.constructor = function (scope) {
			scope.apiService = new Akimbo.App.Services.ApiService();
		};

		this.listeners = function (scope) {
			scope.apiService.listen('index.done', function (data) {
				$('[data-content] ul').html($('#items').render(data));
			}, scope.getDefaultInstance());
		};

		this.init = function (scope) {
			scope.apiService.index(null, scope.getDefaultInstance());
		};
	}
})(akimbo);