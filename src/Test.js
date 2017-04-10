(function (Akimbo) {
	Akimbo.Test = Test;

	function Test() {}

	Test.prototype = {
		component: function (classzor) {
			var component = new classzor();

			if (component.meta === undefined) {
				throw '"' + component.name + '" meta property must be defined';
			}

			if (component.meta.constructor === undefined) {
				throw '"' + component.name.constructor + '" constructor must be defined';
			}

			$.ajaxSetup({async: false});

			$('body').remove('[' + component.meta.selector + ']').append('<div ' + component.meta.selector + ' style="display:none"></div>');

			$('[' + component.meta.selector + ']').load('../' + component.meta.templateUrl + '?' + new Date().getTime(), function () {});

			$.ajaxSetup({async: true});

			component.getDefaultInstance = function () {
				return component;
			};

			component.constructor(component);

			if (component.listeners !== undefined) {
				component.listeners(component);
			}

			return component;
		}
	};
})(akimbo);