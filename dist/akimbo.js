//#TODO!: remove unnecessary jQuery?
;
'use strict';

var akimbo = {};

/*
 * Setup namespaces & wait for document to be loaded before starting Akimbo
 */
(function (akimbo) {
	akimbo.App = {};
	akimbo.App.Services = {};
	akimbo.App.Components = {};
	akimbo.App.Controllers = {};
	akimbo.App.Classes = {};
	akimbo.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new akimbo.Main();
		}
	};
})(akimbo);

/*
 * Entry point
 */
(function (akimbo) {
	akimbo.Main = Main;

	var instance = null;

	function Main() {
		//#TODO!: re-add anchor back if pushState not supported
		if (history.pushState === undefined) {
			alert('history.pushState() not supported.');
		}

		if (instance === null) {
			instance = this;
			instance.router = new akimbo.Router();

			window.onpopstate = function () {
				instance.router.ignoreHistory = true;

				navigate();
			};

			navigate();
		}
	}

	function navigate() {
		instance.router.navigate(window.location.protocol.indexOf('http') !== -1 ? window.location.pathname.replace('/', '') : '');
	}
})(akimbo);
(function (akimbo) {
	akimbo.Cache = Cache;

	var instance = null;
	var data = {};

	function Cache() {
		if (instance === null) {
			instance = this;
		}
	}

	Cache.prototype = {
		get: function (index) {
			if (data[index] !== undefined) {
				return data[index];
			}

			return null;
		},
		set: function (index, value) {
			if (value === undefined) {
				throw 'Cache.set(): ' + index + ' value cannot be undefined';
			}

			data[index] = value;
		},
		remove: function (index) {
			delete data[index];
		},
		removeAll: function () {
			data = {};
		}
	};
})(akimbo);
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

	Component.prototype = {
		load: function (classzor) {
			if (classzor === undefined) {
				throw '"' + classzor + '" not found';
			}

			var component = new classzor();

			//#TODO!: remove JSON so that we dont have to cater for IE
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
(function (akimbo) {
	akimbo.Config = Config;

	var instance = null;

	function Config() {
		if (instance === null) {
			instance = this;
		}
	}

	Config.prototype = {
		get: function (config) {
			return akimbo.App.Config[config];
		}
	};
})(akimbo);
(function (akimbo) {
	akimbo.Event = Event;

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

				//#TODO!: remove JSON so that we dont have to cater for IE
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
})(akimbo);
(function (akimbo) {
	akimbo.Router = Router;

	var core = null;
	var busy = false;
	var route = {};
	var path = '';
	var removeClass = true;
	var segments = [];

	function Router() {
		this.ignoreHistory = false;
		this.config = new akimbo.Config();
		this.component = new akimbo.Component();
		this.event = new akimbo.Event();
	}

	Router.prototype = {
		navigate: function (requestedPath, removeClassParam) {
			var scope = this;
			var routeExists = false;
			//#TODO: pass segments to ALL controllers and child components
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

				//if no exact match was found then check if requested path matches a {bracketed} path
				if (!routeExists) {
					$.each(scope.config.get('routes'), function () {
						//contains at least 1 bracket
						if (this.path.indexOf('{') !== -1) {
							var pathPieces = this.path.split('/');
							var segmentsMatch = true;

							//must contain the same URI segment count
							if (pathPieces.length === segments.length) {
								for (var i in pathPieces) {
									//current segment doesnt contain a bracket and routes path + requested path segments dont match then we know its invalid
									if (pathPieces[i].indexOf('{') === -1 && pathPieces[i] !== segments[i]) {
										segmentsMatch = false;

										break;
									}
								}
							} else {
								segmentsMatch = false;
							}

							if (segmentsMatch) {
								routeExists = true;
								path = requestedPath;
								route = this;

								process.apply(scope);
							}
						}
					});
				}

				//if a route is still not found then the URI is not something that exists inside Config.routes
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
		loadController(scope);
		loadCoreComponents.apply(scope);

		//prevent default anchor click if it has disabled attribute
		$(document).on('click', 'a[disabled]', function (e) {
			e.preventDefault();
		});

		//#TODO: optimise?
		if (document.addEventListener) {
			document.addEventListener('click', function (e) {
				if ($(e.target).closest('a[disabled]').length) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}
			}, true);
		} else {
			document.attachEvent('onclick', function (e) {
				if ($(e.target).closest('a[disabled]').length) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}
			});
		}

		busy = false;
	}

	function destroy() {
		//remove previous page element bindings
		$('*').unbind().off().stop(true, true);

		$(window).off();

		$(document).off();

		//remove previous page events
		this.event.remove();

		//core has been loaded then destroy
		if (core !== null) {
			//reset Component global "layout has loaded" var to false as we are loading a new page
			this.component.setLayoutHasLoaded(false);

			//unload all previously loaded components
			this.component.unload();
		}
	}

	function loadCore() {
		core = new this.component.load(akimbo.App.Core);

		//if core has a constructor method then call it now
		if (core.constructor !== undefined) {
			core.constructor(core);
		}

		//if core has a before method then call it now
		if (core.before !== undefined) {
			core.before(core);
		}
	}

	function loadController(scope) {
		var controller = akimbo.App.Controllers[route.controller];

		if (controller === undefined) {
			throw 'akimbo.App.Controllers.' + route.controller + ' does not exist';
		}

		controller = new scope.component.load(akimbo.App.Controllers[route.controller]);

		//remove body class and add if controller meta property specified
		if (removeClass) {
			$('body').removeClass();
		}

		if (controller.meta !== undefined) {
			if (controller.meta.templateClass !== undefined) {
				$('body').addClass(controller.meta.templateClass);
			}
		}

		if ((history.length > 1 || (history.length === 1 && path !== '')) && !scope.ignoreHistory && window.location.pathname.replace('/', '') !== path) {
			history.pushState({page: path}, null, '/' + path);
		}

		controller.segments = segments;
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
})(akimbo);
(function (akimbo) {
	akimbo.Service = Service;

	function Service(params) {
		if (params.name === undefined) {
			throw 'Service "name" param must be specified';
		}

		this.listeners = {};
		this.name = params.name;
		this.serviceUrl = params.serviceUrl;
		this.uri = params.uri;
		this.events = $.extend(true, {
			create: {
				done: 'create.done',
				fail: 'create.fail',
				complete: 'create.complete'
			},
			read: {
				done: 'read.done',
				fail: 'read.fail',
				complete: 'read.complete'
			},
			update: {
				done: 'update.done',
				fail: 'update.fail',
				complete: 'update.complete'
			},
			destroy: {
				done: 'destroy.done',
				fail: 'destroy.fail',
				complete: 'destroy.complete'
			},
			index: {
				done: 'index.done',
				fail: 'index.fail',
				complete: 'index.complete'
			}
		}, params.overrideEvents);

		(function constructor(scope) {
			scope.config = new akimbo.Config();
			scope.cache = new akimbo.Cache();
			scope.event = new akimbo.Event();
		})(this);
	}

	Service.prototype.name = Service.name;

	Service.prototype.create = function (params, object, overrideEvents) {
		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);

		this.listeners.create = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'POST',
			data: params,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.create.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.create.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.create.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};

	Service.prototype.read = function (params, object, overrideEvents) {
		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);
		var identifier = 'read';

		if (params !== undefined && params !== null && params.identifier !== undefined) {
			identifier = params.identifier;
		}

		this.listeners.read = $.ajax({
			url: this.serviceUrl + '/' + this.uri + '/' + identifier,
			type: 'GET',
			headers: params
		}).done(function (response) {
			scope.event.broadcast(events.read.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.read.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.read.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};

	Service.prototype.update = function (params, object, overrideEvents) {
		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);

		this.listeners.update = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'PUT',
			data: params,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.update.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.update.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.update.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};

	Service.prototype.destroy = function (params, object, overrideEvents) {
		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);

		this.listeners.update = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'DELETE',
			data: params,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.destroy.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.destroy.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.destroy.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};

	Service.prototype.index = function (params, object, overrideEvents) {
		var scope = this;
		var events = $.extend(true, this.events, overrideEvents);

		this.listeners.index = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'GET',
			headers: params
		}).done(function (response) {
			scope.event.broadcast(events.index.done, response, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.index.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.index.complete, null, object !== undefined && object !== null ? $.extend({}, scope, object) : scope);
		});
	};

	Service.prototype.cancel = function (listener) {
		if (listener !== undefined) {
			if (this.listeners[listener] !== null) {
				this.listeners[listener].abort();
			}
		} else {
			$.each(this.listeners, function () {
				this.abort();
			});
		}
	};

	Service.prototype.listen = function (event, callback, object) {
		if (object === undefined) {
			throw 'listener "object" parameter must be specified for ' + this.name;
		}

		this.event.listen(event, callback, object !== undefined && object !== null ? $.extend({}, this, object) : this);
	};
})(akimbo);
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