(function (Akimbo) {
	Akimbo.Config = Config;

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
				var namespace = new Akimbo.App.Config[pieces[0]];

				//build namespace into object
				for (var i = 1; i < pieces.length; i++) {
					if (namespace[pieces[i]] === undefined) {
						throw '"' + config + '" config does not exist';
						break;
					}

					namespace = namespace[pieces[i]];
				}

				return namespace;
			} else {
				return new Akimbo.App.Config[config];
			}
		}
	};
})(akimbo);