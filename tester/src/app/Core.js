(function (akimbo) {
	akimbo.App.Core = Core;

	function Core() {
		this.meta = {
			components: [
				akimbo.App.Components.HeaderComponent
			]
		};
	}
})(akimbo);