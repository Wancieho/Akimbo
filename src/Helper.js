(function (Akimbo) {
	Akimbo.Helper = Helper;

	function Helper() {}

	Helper.prototype = {
		functionName: function (func) {
			var f = typeof func === 'function';
			var s = f && ((func.name && ['', func.name]) || func.toString().match(/function ([^\(]+)/));

			return (!f && 'not a function') || (s && s[1] || 'anonymous');
		}
	};
})(akimbo);