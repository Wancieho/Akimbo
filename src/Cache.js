(function (Akimbo) {
	Akimbo.Cache = Cache;

	var instance = null;
	var data = {};

	function Cache() {
		if (instance === null) {
			instance = this;

			this.event = new Akimbo.Event();
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

			instance.event.broadcast('set', {
				index: index,
				value: value
			});
		},
		remove: function (index) {
			if (index !== undefined) {
				delete data[index];
			} else {
				data = {};
			}
		},
		on: function (event, callback) {
			return instance.event.listen(event, callback);
		}
	};
})(akimbo);