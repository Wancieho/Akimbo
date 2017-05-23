(function (Akimbo, $, QUnit) {
	function TestControllers() {
		(function constructor(scope) {
			scope.test = new Akimbo.Test();
		})(this);

		var scope = this;

		QUnit.test('services.controller', function (assert) {
			var done = assert.async();

			scope.test.component(Akimbo.App.Controllers.ServicesController);

//			controller.locationService.index({object: controller.instance});

//			done();
		});
	}

	new TestControllers();
})(akimbo, jQuery, QUnit);