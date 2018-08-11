(function (Akimbo, $, QUnit) {
	function TestServices() {
		(function constructor(scope) {
			scope.locationService = new Akimbo.App.Services.LocationService();
			scope.apiService = new Akimbo.App.Services.ApiService();
		})(this);

		var scope = this;

		QUnit.test('location.service.index', function (assert) {
			var done = assert.async();

			scope.locationService.listen('index.done', function (data) {
				assert.notStrictEqual(data.city, undefined);
				assert.strictEqual(typeof data.city, 'string');

				assert.notStrictEqual(data.region_name, undefined);
				assert.strictEqual(typeof data.region_name, 'string');
			}, this);

			scope.locationService.listen('index.always', function () {
				done();
			}, this);

			scope.locationService.index({object: this});
		});

		QUnit.test('api.service.create', function (assert) {
			var done = assert.async();

			scope.apiService.listen('create.done', function (data) {
				assert.notStrictEqual(data.id, undefined);
				assert.strictEqual(typeof data.id, 'number');
			}, this);

			scope.apiService.listen('create.always', function () {
				done();
			}, this);

			scope.apiService.create({object: this});
		});

		QUnit.test('api.service.read', function (assert) {
			var done = assert.async();

			scope.apiService.listen('read.done', function (data) {
				assert.strictEqual(Object.keys(data).length, 4);

				assert.notStrictEqual(data.userId, undefined);
				assert.strictEqual(typeof data.userId, 'number');

				assert.notStrictEqual(data.id, undefined);
				assert.strictEqual(typeof data.id, 'number');

				assert.notStrictEqual(data.title, undefined);
				assert.strictEqual(typeof data.title, 'string');

				assert.notStrictEqual(data.body, undefined);
				assert.strictEqual(typeof data.body, 'string');
			}, this);

			scope.apiService.listen('read.always', function () {
				done();
			}, this);

			scope.apiService.read({
				identifier: 1,
				object: this
			});
		});

		QUnit.test('api.service.update', function (assert) {
			var done = assert.async();

			scope.apiService.listen('update.done', function (data) {
				assert.notStrictEqual(data.id, undefined);
				assert.strictEqual(typeof data.id, 'number');
			}, this);

			scope.apiService.listen('update.always', function () {
				done();
			}, this);

			scope.apiService.update({
				identifier: 1,
				object: this
			});
		});

		QUnit.test('api.service.destroy', function (assert) {
			var done = assert.async();

			scope.apiService.listen('destroy.done', function (data) {
				assert.strictEqual(Object.keys(data).length, 0);
			}, this);

			scope.apiService.listen('destroy.always', function () {
				done();
			}, this);

			scope.apiService.destroy({
				identifier: 1,
				object: this
			});
		});

		QUnit.test('api.service.index', function (assert) {
			var done = assert.async();

			scope.apiService.listen('index.done', function (data) {
				assert.strictEqual(data.length, 100);
			}, this);

			scope.apiService.listen('index.always', function () {
				done();
			}, this);

			scope.apiService.index({object: this});
		});

		QUnit.test('service.override.events', function (assert) {
			var done = assert.async();

			scope.apiService.listen('done', function (data) {
				assert.strictEqual(data.length, 100);
			}, this);

			scope.apiService.listen('always', function () {
				done();
			}, this);

			scope.apiService.index({
				object: this,
				overrideEvents: {
					index: {
						done: 'done',
						fail: 'fail',
						always: 'always'
					}
				}
			});
		});
	}

	new TestServices();
})(akimbo, jQuery, QUnit);