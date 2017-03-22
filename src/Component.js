//#TODO: rename to Loader?
(function (akimbo) {
	akimbo.Component = Component;

	var componentsLoaded = [];
	var scope = null;
	var layoutHasLoaded = false;

	function Component() {
		scope = this;
		scope.event = new akimbo.Event();
	}

	function getFnName(fn) {
		var f = typeof fn === 'function';
		var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
		return (!f && 'not a function') || (s && s[1] || 'anonymous');
	}

	Component.prototype = {
		load: function (classzor) {
			if (classzor === undefined) {
				throw '"' + classzor + '" not found';
			}

			var component = new classzor();

			component.name = getFnName(classzor);

			var initialState = JSON.parse(JSON.stringify(component));

			component.getDefaultInstance = function () {
				return initialState;
			};

			//add this component to componentsLoaded array for later unloading
			componentsLoaded.unshift(component);

			//only check required meta properties if not Core
			if (component instanceof akimbo.App.Core === false) {
				if (component.meta === undefined) {
					throw '"' + component.constructor.name + '" meta property must be defined';
				}

				if (component.meta.selector === undefined) {
					throw '"' + component.constructor.name + '" meta property selector must be defined';
				}

				if (component.meta.templateUrl === undefined || component.meta.templateUrl === '') {
					throw '"' + component.constructor.name + '" meta property templateUrl must be defined';
				}

				//#TODO: check templateUrl file exists

				if (component.meta.layout === undefined) {
					component.meta.layout = 'index';
				}

				//prevent developer mistakes of loading multiple layouts per page load
				if (!layoutHasLoaded) {
					//#TODO!!: if default or specified layout doesnt exist then throw error
					$('[data-layout]').load('src/app/layouts/' + component.meta.layout + '.html', function () {
						layoutHasLoaded = true;

						scope.event.broadcast('layout.loaded');
					});
				} else {
					loadTemplateAndInitiateComponent(component, component.constructor.name);
				}
			}

			scope.event.listen('layout.loaded', function () {
				if (component instanceof akimbo.App.Core === false) {
					loadTemplateAndInitiateComponent(component, component.constructor.name);
				}
			});

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
		$('[' + component.meta.selector + ']').load(component.meta.templateUrl, function () {
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
	}

	function initiateComponent(component) {
		//call constructor method if it exists
		if (component.constructor !== undefined) {
			//#TODO: remove once new structure implemented
			setTimeout(function () {
				component.constructor(component);
			}, 100);
		}

		//call before method if it exists
		if (component.before !== undefined) {
			//#TODO: remove once new structure implemented
			setTimeout(function () {
				component.before(component);
			}, 100);
		}

		//call after method if it exists
		if (component.after !== undefined) {
			//#TODO: remove once new structure implemented
			setTimeout(function () {
				component.after(component);
			}, 150);
		}

		$('[' + component.meta.selector + ']').fadeIn(200);

		//component has components specified in meta but dont load Core components just yet we do that in Akimbo.Router
		if (component.meta.components !== undefined && component instanceof akimbo.App.Core === false) {
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