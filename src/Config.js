(function (akimbo) {
	akimbo.Config = Config;

	var instance = null;

	function Config() {
		if (instance === null) {
			instance = this;
		}
	}

	Config.prototype = {
		get: function (config) {
			return akimbo.App.Config[config];
		}
	};
})(akimbo);