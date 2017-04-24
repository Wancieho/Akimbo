//#TODO: rename to Loader?
(function (Akimbo) {
	Akimbo.Component = Component;

	var componentsLoaded = [];
	var scope = null;
	var layoutHasLoaded = false;

	function Component() {
		scope = this;
		scope.helper = new Akimbo.Helper();
		scope.cache = new Akimbo.Cache();
	}

	Component.prototype = {
		load: function (classzor) {
			if (classzor === undefined) {
				throw '"' + classzor + '" not found';
			}

			var component = new classzor();
			component.name = scope.helper.functionName(classzor);
			component.segments = scope.cache.get('segments');

			//#TODO!: remove JSON so that we dont have to cater for IE
			var initialState = JSON.parse(JSON.stringify(component));

			component.getDefaultInstance = function () {
				return initialState;
			};

			//add this component to componentsLoaded array for later unloading
			componentsLoaded.unshift(component);

			//only check required meta properties if not Core
			if (component instanceof Akimbo.App.Core === false) {
				if (component.meta === undefined) {
					//#TODO: implement function that gets class name
					throw '"' + component.name + '" meta property must be defined';
				}

				if (component.meta.selector === undefined) {
					throw '"' + component.name + '" meta property selector must be defined';
				}

				if (component.meta.templateUrl === undefined || component.meta.templateUrl === '') {
					throw '"' + component.name + '" meta property templateUrl must be defined';
				}

				//#TODO: check templateUrl file exists

				if (component.meta.layout === undefined) {
					component.meta.layout = 'index';
				}

				//prevent developer mistakes of loading multiple layouts per page load
				if (!layoutHasLoaded) {
					$.ajaxSetup({async: false});

					//#TODO!!: if default or specified layout doesnt exist then throw error
					$('[data-layout]').load('src/app/layouts/' + component.meta.layout + '.html?' + new Date().getTime(), function () {
						layoutHasLoaded = true;
					});

					$.ajaxSetup({async: true});
				}

				loadTemplateAndInitiateComponent(component);
			}

			return component;
		},
		loadComponents: function (components) {
			$.each(components, function (i, component) {
				scope.load(component);
			});
		},
		setLayoutHasLoaded: function (loaded) {
			layoutHasLoaded = loaded;
		},
		unload: function () {
			$.each(componentsLoaded, function (i, component) {
				//run unload method if declared
				//#TODO: maybe add something here to destroy running AJAX instead of in AppComponent
				if (component.unload !== undefined) {
					component.unload();
				}

				//remove HTML
				$('[' + component.meta.selector + ']').empty().remove();

				//#TODO: google closure compiler doesnt allow this?
//				delete $('[' + component.meta.selector + ']');

				//delete instance
				component = null;

				//#TODO: google closure compiler doesnt allow this?
//				delete component;
			});

			componentsLoaded = [];

			$('[data-layout]').empty();
		}
	};

	function loadTemplateAndInitiateComponent(component) {
		$.ajaxSetup({async: false});

		$('[' + component.meta.selector + ']').load(component.meta.templateUrl + '?' + new Date().getTime(), function () {
			//disable default anchor click event
			$('a').on('click', function (e) {
				e.preventDefault();
			});

			//only initiate the component now if there were no templates to be loaded otherwise let the templates loaded through AJAX and once done they will initiate component
			if (component.meta.templates === undefined) {
				initiateComponent(component);
			} else {
				component.templatesLoaded = 0;

				$.each(component.meta.templates, function (key) {
					loadTemplate.apply(component, [component.meta.templates[key]]);
				});
			}
		});

		$.ajaxSetup({async: true});
	}

	function initiateComponent(component) {
		if (component.constructor !== undefined) {
			component.constructor(component);
		}

		if (component.listeners !== undefined) {
			component.listeners(component);
		}

		if (component.events !== undefined) {
			component.events(component);
		}

		if (component.init !== undefined) {
			component.init(component);
		}

		$('[' + component.meta.selector + ']').fadeIn(200);

		//component has components specified in meta but dont load Core components just yet we do that in Akimbo.Router
		if (component.meta.components !== undefined && component instanceof Akimbo.App.Core === false) {
			scope.loadComponents(component.meta.components);
		}
	}

	function loadTemplate(templateObject) {
		var component = this;

		$.ajax({
			url: templateObject.template
		}).done(function (html) {
			templateObject.html = html;

			if (++component.templatesLoaded === $.map(component.meta.templates, function (value, index) {
				return [value];
			}).length) {
				initiateComponent(component);
			}
		});
	}
})(akimbo);