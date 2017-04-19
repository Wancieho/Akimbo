(function (Akimbo, $, QUnit) {
	function TestCache() {
		(function constructor(scope) {
			scope.cache = new Akimbo.Cache();
		})(this);

		var scope = this;

		QUnit.test('cache', function (assert) {
			scope.cache.set('store', 'info');

			//test invalid cache
			assert.strictEqual(scope.cache.get('invalid'), null);

			//test to check stored cache did return correctly
			assert.strictEqual(typeof scope.cache.get('store'), 'string');
			assert.strictEqual(scope.cache.get('store'), 'info');
		});
	}

	new TestCache();
})(akimbo, jQuery, QUnit);