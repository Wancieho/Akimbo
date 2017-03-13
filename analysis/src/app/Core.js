(function (root) {
	root.App.Core = Core;

	function Core() {
		this.meta = {
			components: [
				root.App.Components.HeaderComponent
			]
		};
	}
})(this);