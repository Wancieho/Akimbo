(function (Akimbo, $) {
	Akimbo.Test = Test;

	function Test() {}

	Test.prototype = {
		component: function (classzor) {
			this.component = new classzor();

			if (this.component.meta === undefined) {
				throw '"' + this.component.name + '" meta property must be defined';
			}

			if (this.component.meta.constructor === undefined) {
				throw '"' + this.component.name.constructor + '" constructor must be defined';
			}

			$.ajaxSetup({async: false});

			$('body > div').not('#qunit').remove();

			$('body').append('<div ' + this.component.meta.selector + ' style="display:none"></div>');

			$('[' + this.component.meta.selector + ']').load('../demo/' + this.component.meta.templateUrl + '?' + new Date().getTime(), function () {});

			$.ajaxSetup({async: true});

			this.component.instance = JSON.parse(JSON.stringify(this.component));

			this.component.constructor(this.component);

			if (this.component.listeners !== undefined) {
				this.component.listeners(this.component);
			}

			if (this.component.events !== undefined) {
				this.component.events(this.component);
			}

			return this.component;
		}
	};
})(akimbo, jQuery);