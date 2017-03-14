(function () {
	console.debug(this);

	function Protected() {
		console.debug(this);
	}

	var protected = new Protected();

	console.debug(protected);

	(function (root) {
		root.Main = Main;

		function Main() {
			console.debug(this);
		}
	})(protected);

	new protected.Main();
})();