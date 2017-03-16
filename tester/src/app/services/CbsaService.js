(function (akimbo) {
	akimbo.App.Services.CbsaService = CbsaService;

	function CbsaService() {}

	CbsaService.prototype = new akimbo.Service({
		name: 'CbsaService',
		uri: '',
		serviceUrl: new akimbo.Config().get('settings.serviceUrl')
	});
})(akimbo);