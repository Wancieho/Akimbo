(function (Akimbo, $, QUnit) {
	function TestEvent() {
		(function constructor(scope) {
			scope.event = new Akimbo.Event();
		})(this);

		var scope = this;

		QUnit.test('event', function (assert) {
			var done = assert.async();

			scope.event.listen('custom.event', function (data) {
				assert.strictEqual(data instanceof Object, true);
				assert.strictEqual(data.random, 'string');

				done();
			});

			scope.event.broadcast('custom.event', {
				random: 'string'
			});
		});
	}

	new TestEvent();
})(akimbo, jQuery, QUnit);