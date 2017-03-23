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
			//requested config has a . means we dont just get the root object the request is looking through a hierarchial object
			if (config.indexOf('.') !== -1) {
				var pieces = config.split('.');
				var namespace = akimbo.App.Config;

				//build namespace into object
				for (var i = 0; i < pieces.length; i++) {
					if (namespace[pieces[i]] === undefined) {
						throw '"' + config + '" config does not exist';
						break;
					}

					namespace = namespace[pieces[i]];
				}

				return namespace;
			} else {
				return akimbo.App.Config[config];
			}
		}
	};
})(akimbo);