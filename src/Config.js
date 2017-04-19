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
				var namespace = Akimbo.App.Config[pieces[0]];

				if (namespace === undefined) {
					return null;
				}

				var namespaces = new namespace;

				//build namespace into object
				for (var i = 1; i < pieces.length; i++) {
					if (namespaces[pieces[i]] === undefined) {
						return null;
					}

					namespaces = namespaces[pieces[i]];
				}

				return namespaces;
			} else {
				var chunk = Akimbo.App.Config[config];

				if (chunk === undefined) {
					return null;
				}

				return new chunk;
			}
		}
	};
})(akimbo);