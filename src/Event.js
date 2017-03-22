(function (akimbo) {
	akimbo.Event = Event;

	var listeners = [];

	function Event() {
	}

	Event.prototype = {
		listen: function (event, callback, object) {
			//#TODO: dont allow adding to listeners if event (and/or object) already exists? problem is many functions can use same event so preventing adding a duplicate listener needs to take callback uniqueness into consideration
			listeners.push({
				event: event,
				callback: callback,
				object: object
			});
		},
		broadcast: function (event, data, object) {
			if (object === undefined) {
				object = null;
			}

			//#TODO: rather use JS loop to not depend too much on jQuery for System
			$.each(listeners, function () {
				var isWildCard = false;

				if (this.event.indexOf('*') !== -1) {
					if (event.indexOf(this.event.replace('*', '')) !== -1) {
						isWildCard = true;
					}
				}

				//#TODO!: remove JSON so that we dont have to cater for IE
				if (((object === undefined || object === null) && event === this.event) || ((object !== undefined && object !== null && JSON.stringify(object) === JSON.stringify(this.object)) && event === this.event) || isWildCard) {
					this.callback(data);
				}
			});
		},
		//#TODO: remove event only for specific object
		remove: function (event) {
			if (event !== undefined) {
				$.each(listeners, function (i) {
					if (this.event === event) {
						listeners.splice(i, 1);
					}
				});
			} else {
				listeners = [];
			}
		}
	};
})(akimbo);