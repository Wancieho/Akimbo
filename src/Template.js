(function (akimbo) {
	akimbo.Template = Template;

	function Template() {}

	Template.prototype = {
		render: function (data, html, element) {
			//#TODO: validate data is object (or array?)
			var output = html;

			$.each(data, function (key, val) {
				//#TODO: trim any spaces
//				html = html.replace(/{{\s*/g, '{{');
//				html = html.replace(/\s*}}/g, '}}');

				output = output.replace(new RegExp('{{' + key + '}}', 'g'), val);
			});

			element.append(output);

			element.find('a').on('click', function (e) {
				e.preventDefault();
			});

			return output;
		}
	};
})(akimbo);