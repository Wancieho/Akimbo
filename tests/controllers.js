(function (Akimbo, $, QUnit) {
	function TestControllers() {
		QUnit.test('home.controller', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Controllers.HomeController);
			controller.init(controller);

			assert.strictEqual($('[' + controller.meta.selector + '] h1').text(), 'Home');
		});

		QUnit.test('cache.controller', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Controllers.CacheController);
			controller.init(controller);

			assert.strictEqual($('[' + controller.meta.selector + '] p span').text(), 'Hello World');
		});

		QUnit.test('events.controller', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Controllers.EventsController);
			controller.init(controller);

			assert.strictEqual($('[' + controller.meta.selector + '] p').length, 2);
			assert.strictEqual($('[' + controller.meta.selector + '] p').eq(0).text(), '"loaded" event caught');
			assert.strictEqual($('[' + controller.meta.selector + '] p').eq(1).text(), '"cache set" event caught: "{"index":"i","value":{"am":"object"}}"');
		});

		QUnit.test('services.controller', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Controllers.ServicesController);

			controller.locationService.listen(controller.locationService.events.index.done, function (data) {
				assert.strictEqual($('[' + controller.meta.selector + '] div').text(), JSON.stringify(data));
			}, controller.instance);

			controller.locationService.event.broadcast(controller.locationService.events.index.done, [
				{
					latitude: -26.1569,
					longitude: 27.8882
				}
			], $.extend({}, controller.locationService, controller.instance));
		});

		QUnit.test('templates.controller', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Controllers.TemplatesController);

			controller.apiService.listen(controller.apiService.events.index.done, function (data) {
				assert.strictEqual(Object.keys(data).length, 2);
				assert.strictEqual($('[' + controller.meta.selector + '] ul li').length, 2);
			}, controller.instance);

			controller.apiService.event.broadcast(controller.apiService.events.index.done, [
				{
					title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
					body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto'
				},
				{
					title: 'qui est esse',
					body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla'
				}
			], $.extend({}, controller.apiService, controller.instance));
		});
	}

	new TestControllers();
})(akimbo, jQuery, QUnit);