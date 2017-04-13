(function (Akimbo, $, QUnit) {
	function Api() {
		(function constructor(scope) {
			scope.locationService = new Akimbo.App.Services.LocationService();
			scope.apiService = new Akimbo.App.Services.ApiService();
		})(this);

		var scope = this;

		QUnit.test('locationService', function (assert) {
			var done = assert.async();

			scope.locationService.listen('index.done', function (data) {
				assert.notStrictEqual(data.city, undefined);
				assert.strictEqual(typeof data.city, 'string');

				assert.notStrictEqual(data.region_name, undefined);
				assert.strictEqual(typeof data.region_name, 'string');
			}, scope);

			scope.locationService.listen('index.complete', function () {
				done();
			}, scope);

			scope.locationService.index(null, scope);
		});

		QUnit.test('apiService', function (assert) {
			var done = assert.async();

			scope.apiService.listen('index.done', function (data) {
				assert.strictEqual(data.length, 100);
			}, scope);

			scope.apiService.listen('index.complete', function () {
				done();
			}, scope);

			scope.apiService.index(null, scope);
		});
	}

	new Api();
})(akimbo, jQuery, QUnit);