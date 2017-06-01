(function (Akimbo) {
	Akimbo.Helper = Helper;

	function Helper() {}

	Helper.prototype = {
		functionName: function (func) {
			var f = typeof func === 'function';
			var s = f && ((func.name && ['', func.name]) || func.toString().match(/function ([^\(]+)/));

			return (!f && 'not a function') || (s && s[1] || 'anonymous');
		},
		stringToNamespace: function (stringNamespace) {
			var pieces = stringNamespace.split('.');
			var namespace = Akimbo;

			//build namespace into object
			for (var i = 1; i < pieces.length; i++) {
				namespace = namespace[pieces[i]];
			}

			if (namespace === undefined) {
				//#TODO: rather generate alerts as Cordova doesnt display throws?
				throw '"' + stringNamespace + '" does not exist';
			}

			return namespace;
		}
	};
})(akimbo);