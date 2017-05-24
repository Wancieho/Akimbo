(function (Akimbo, $, QUnit) {
	function TestComponents() {
		QUnit.test('header.component', function (assert) {
			var controller = new Akimbo.Test().component(Akimbo.App.Components.HeaderComponent);

			assert.strictEqual($('[' + controller.meta.selector + '] ul li').length, 5);
			assert.strictEqual($('[' + controller.meta.selector + '] ul li:nth-child(1) a').text(), 'Home');
			assert.strictEqual($('[' + controller.meta.selector + '] ul li:nth-child(2) a').text(), 'Services');
			assert.strictEqual($('[' + controller.meta.selector + '] ul li:nth-child(3) a').text(), 'Events');
			assert.strictEqual($('[' + controller.meta.selector + '] ul li:nth-child(4) a').text(), 'Cache');
			assert.strictEqual($('[' + controller.meta.selector + '] ul li:nth-child(5) a').text(), 'Templates');
		});
	}

	new TestComponents();
})(akimbo, jQuery, QUnit);