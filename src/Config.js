(function (root) {
	root.Akimbo.Config = Config;

	var instance = null;

	function Config() {
		if (instance === null) {
			instance = this;
		}
	}

	Config.prototype = {
		get: function (config) {
			if (config === 'routes') {
				return new root.App.Config.Routes().get();
			} else if (config.indexOf('settings') !== -1) {
				var settings = new Config.Settings();

				//requested config has a . means we dont just get the root object the request is looking through a hierarchial object
				if (config.indexOf('.') !== -1) {
					var dropPrefix = config.replace('settings.', '');
					var pieces = dropPrefix.split('.');
					var settings = settings.get();

					//build namespace into object
					for (var i = 0; i < pieces.length; i++) {
						if (settings[pieces[i]] === undefined) {
							throw '"' + config + '" config does not exist';
							break;
						}

						settings = settings[pieces[i]];
					}

					return settings;
				} else { //just return entire settings object
					return settings.get();
				}
			}
		}
	};
})(this);