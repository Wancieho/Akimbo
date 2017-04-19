(function (Akimbo, $, QUnit) {
	function TestConfig() {
		(function constructor(scope) {
			scope.config = new Akimbo.Config();
		})(this);

		var scope = this;

		QUnit.test('routes', function (assert) {
			//test an invalid config actually returns null
			assert.strictEqual(scope.config.get('is.null'), null);

			//test a valid config actually returns
			var routes = scope.config.get('routes');
			var rootPathExists = false;

			//test a valid config array config is returned as an array
			assert.strictEqual(routes instanceof Array, true);

			for (var i in routes) {
				if (routes[i].path === '') {
					rootPathExists = true;
				}
			}

			assert.strictEqual(rootPathExists, true);
		});
	}

	new TestConfig();
})(akimbo, jQuery, QUnit);