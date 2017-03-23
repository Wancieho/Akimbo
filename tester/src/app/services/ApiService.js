(function (Akimbo) {
	Akimbo.App.Services.ApiService = ApiService;

	function ApiService() {
		this.name = new Akimbo.Helper().functionName(ApiService);
		this.uri = 'product';
		this.serviceUrl = new Akimbo.Config().get('settings.serviceUrl');
	}

	ApiService.prototype = new Akimbo.Service();
})(akimbo);