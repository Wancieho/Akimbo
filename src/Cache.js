(function (Akimbo) {
	Akimbo.Cache = Cache;

	var instance = null;
	var data = {};

	function Cache() {
		if (instance === null) {
			instance = this;
		}
	}

	Cache.prototype = {
		get: function (index) {
			if (data[index] !== undefined) {
				return data[index];
			}

			return null;
		},
		set: function (index, value) {
			if (value === undefined) {
				throw 'Cache.set(): ' + index + ' value cannot be undefined';
			}

			data[index] = value;
		},
		remove: function (index) {
			if (index !== undefined) {
				delete data[index];
			} else {
				data = {};
			}
		}
	};
})(akimbo);