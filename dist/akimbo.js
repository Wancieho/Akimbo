//#TODO: create checks to make sure all dependancies exist on startup eg. env.js
//#TODO: also destroy things like Cache and Events when root # is loaded
//#TODO!: remove all jQuery

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (root) {
	root.Akimbo = {};
	root.App = {};
	root.App.Pages = {};
	root.App.Components = {};
	root.App.Services = {};
	root.App.Classes = {};
	root.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new root.Akimbo.Main();
		}
	};
})(this);

/*
 * Initialisation
 */
(function (root) {
	root.Akimbo.Main = Main;

	var instance = null;

	function Main() {
		if (instance === null) {
			instance = this;
			this.router = new root.Akimbo.Router();

			loadRoute(this);
		}
	}

	function loadRoute(scope) {
		var route = '';

		//refresh (F5 etc.) loads current hash
		if (window.location.hash !== '') {
			route = window.location.hash.replace('#', '');
		}

		scope.router.navigate(route);
	}
})(this);
//#TODO: rename to Loader?
(function (root) {
	root.Akimbo.Component = Component;

	var componentsLoaded = [];
	var scope = null;
	var layoutHasLoaded = false;

	function Component() {
		scope = this;
		scope.event = new root.Akimbo.Event();
	}

	Component.prototype = {
		load: function (classzor) {
			if (classzor === undefined) {
				throw '"' + classzor + '" not found';
			}

			var component = new classzor();

			var initialState = JSON.parse(JSON.stringify(component));

			component.getDefaultInstance = function () {
				return initialState;
			};

			//add this component to componentsLoaded array for later unloading
			componentsLoaded.unshift(component);

			//only check required meta properties if not Core
			if (component instanceof root.App.Core === false) {
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
					$('[data-layout]').load('src/app/layouts/' + component.meta.layout + '.html', function () {
						layoutHasLoaded = true;

						scope.event.broadcast('layout.loaded');
					});
				} else {
					loadTemplateAndInitiateComponent(component, component.constructor.name);
				}
			}

			scope.event.listen('layout.loaded', function () {
				if (component instanceof root.App.Core === false) {
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

				delete $('[' + component.meta.selector + ']');

				//delete instance
				component = null;
				delete component;
			});

			componentsLoaded = [];

			$('[data-layout]').empty();
		}
	};

	function loadTemplateAndInitiateComponent(component, componentName) {
		component.name = componentName;

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
		if (component.meta.components !== undefined && component instanceof root.App.Core === false) {
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
})(this);
(function (root) {
	root.Akimbo.Config = Config;

	var instance = null;

	function Config() {
		if (instance === null) {
			instance = this;
		}
	}

	Config.prototype = {
		get: function (config) {
			if (config === 'routes') {
				return new root.App.Config.Routes().get();
			} else if (config.indexOf('settings') !== -1) {
				var settings = new Config.Settings();

				//requested config has a . means we dont just get the root object the request is looking through a hierarchial object
				if (config.indexOf('.') !== -1) {
					var dropPrefix = config.replace('settings.', '');
					var pieces = dropPrefix.split('.');
					var settings = settings.get();

					//build namespace into object
					for (var i = 0; i < pieces.length; i++) {
						if (settings[pieces[i]] === undefined) {
							throw '"' + config + '" config does not exist';
							break;
						}

						settings = settings[pieces[i]];
					}

					return settings;
				} else { //just return entire settings object
					return settings.get();
				}
			}
		}
	};
})(this);
(function (root) {
	root.Akimbo.Event = Event;

	var listeners = [];

	function Event() {
	}

	Event.prototype = {
		listen: function (event, callback, object) {
			//#TODO: dont allow adding to listeners if event (and/or object) already exists? problem is many functions can use same event so preventing adding a duplicate listener needs to take callback uniqueness into consideration
			listeners.push({
				event: event,
				callback: callback,
				object: object
			});
		},
		broadcast: function (event, data, object) {
			if (object === undefined) {
				object = null;
			}

			//#TODO: rather use JS loop to not depend too much on jQuery for System
			$.each(listeners, function () {
				var isWildCard = false;

				if (this.event.indexOf('*') !== -1) {
					if (event.indexOf(this.event.replace('*', '')) !== -1) {
						isWildCard = true;
					}
				}

				if (((object === undefined || object === null) && event === this.event) || ((object !== undefined && object !== null && JSON.stringify(object) === JSON.stringify(this.object)) && event === this.event) || isWildCard) {
					this.callback(data);
				}
			});
		},
		//#TODO: remove event only for specific object
		remove: function (event) {
			if (event !== undefined) {
				$.each(listeners, function (i) {
					if (this.event === event) {
						listeners.splice(i, 1);
					}
				});
			} else {
				listeners = [];
			}
		}
	};
})(this);
(function (root) {
	root.Akimbo.Router = Router;

	var core = null;
	var page = null;
	var busy = false;
	var route = {};
	var path = '';
	var removeClass = true;
	var segments = [];

	function Router() {
		this.config = new root.Akimbo.Config();
		this.component = new root.Akimbo.Component();
		this.event = new root.Akimbo.Event();
	}

	Router.prototype = {
		navigate: function (requestedPath, removeClassParam) {
			var scope = this;
			var routeExists = false;
			//#TODO: pass segments to ALL components
			segments = requestedPath.split('/');
			removeClass = removeClassParam === false ? false : true;

			if (!busy) {
				var routes = scope.config.get('routes');

				for (var i in scope.config.get('routes')) {
					//requested path matches a path in the routes config exactly
					if (requestedPath === routes[i].path) {
						routeExists = true;
						path = requestedPath;
						route = routes[i];

						process(scope);
					}
				}

//				//if no exact match was found then check if requested path matches a {bracketed} path
//				if (!routeExists) {
//					$.each(scope.config.get('routes'), function () {
//						//contains at least 1 bracket
//						if (this.path.indexOf('{') !== -1) {
//							var pathPieces = this.path.split('/');
//							var segmentsMatch = true;
//
//							//must contain the same URI segment count
//							if (pathPieces.length === segments.length) {
//								for (var i in pathPieces) {
//									//current segment doesnt contain a bracket and routes path + requested path segments dont match then we know its invalid
//									if (pathPieces[i].indexOf('{') === -1 && pathPieces[i] !== segments[i]) {
//										segmentsMatch = false;
//
//										break;
//									}
//								}
//							} else {
//								segmentsMatch = false;
//							}
//
//							if (segmentsMatch) {
//								routeExists = true;
//								path = requestedPath;
//								route = this;
//
//								process.apply(scope);
//							}
//						}
//					});
//				}

				if (!routeExists) {
					throw '"' + requestedPath + '" route not found';
				}
			}
		},
		isProtectedRoute: function () {
			return route.protected;
		}
	};

	function process(scope) {
		busy = true;

		destroy.apply(scope);
		loadCore.apply(scope);
		loadPage.apply(scope);
		loadCoreComponents.apply(scope);

//		//prevent default anchor click if it has disabled attribute
//		$(document).on('click', 'a[disabled]', function (e) {
//			e.preventDefault();
//		});
//
//		document.addEventListener('click', function (e) {
//			if ($(e.target).closest('a[disabled]').length) {
//				e.stopImmediatePropagation();
//				e.preventDefault();
//			}
//		}, true);

		busy = false;
	}

	function destroy() {
//		//remove previous page element bindings
//		$('*').unbind().off().stop(true, true);
//
//		$(window).off();
//
//		$(document).off();

		//remove previous page events
		this.event.remove();

		//set hash to new hash
		window.location.hash = '#' + path;

		//core has been loaded then destroy
		if (core !== null) {
			//reset Component global "layout has loaded" var to false as we are loading a new page
			this.component.setLayoutHasLoaded(false);

			//unload all previously loaded components
			this.component.unload();
		}
	}

	function loadCore() {
		core = new this.component.load(root.App.Core);

		//if core has a constructor method then call it now
		if (core.constructor !== undefined) {
			core.constructor(core);
		}

		//if core has a before method then call it now
		if (core.before !== undefined) {
			core.before(core);
		}
	}

	function loadPage() {
		var page = root.App.Pages[route.page];

		if (page === undefined) {
			throw 'root.App.Pages.' + route.page + ' does not exist';
		}

		page = new this.component.load(root.App.Pages[route.page]);

		//remove body class and add if page component meta property specified
		if (removeClass) {
			$('body').removeClass();
		}

		if (page.meta !== undefined) {
			if (page.meta.templateClass !== undefined) {
				$('body').addClass(page.meta.templateClass);
			}
		}

		page.segments = segments;
	}

	function loadCoreComponents() {
		var scope = this;

		this.event.listen('layout.loaded', function () {
			new scope.component.loadComponents(core.meta.components);

			//if core has an after method then call it now (add slight delay to cater for component templates loading which doesnt cater for net lag)
			setTimeout(function () {
				if (core.after !== undefined) {
					core.after(core);
				}
			}, 50);
		});
	}
})(this);