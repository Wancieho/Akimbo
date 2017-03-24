;
'use strict';

var akimbo = {};

(function (Akimbo) {
	Akimbo.App = {};
	Akimbo.App.Services = {};
	Akimbo.App.Components = {};
	Akimbo.App.Controllers = {};
	Akimbo.App.Classes = {};
	Akimbo.App.Config = {};

	document.onreadystatechange = function () {
		if (this.readyState === 'complete') {
			new Akimbo.Main();
		}
	};
})(akimbo);

(function (Akimbo) {
	Akimbo.Main = Main;

	var instance = null;

	function Main() {
		if (history.pushState === undefined) {
			alert('history.pushState() not supported.');
		}

		if (instance === null) {
			instance = this;
			instance.router = new Akimbo.Router();

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
(function (Akimbo) {
	Akimbo.Cache = Cache;

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

(function (Akimbo) {
	Akimbo.Component = Component;

	var componentsLoaded = [];
	var scope = null;
	var layoutHasLoaded = false;

	function Component() {
		scope = this;
		scope.event = new Akimbo.Event();
		scope.helper = new Akimbo.Helper();
	}

	Component.prototype = {
		load: function (classzor) {
			if (classzor === undefined) {
				throw '"' + classzor + '" not found';
			}

			var component = new classzor();
			component.name = scope.helper.functionName(classzor);

			var initialState = JSON.parse(JSON.stringify(component));

			component.getDefaultInstance = function () {
				return initialState;
			};

			componentsLoaded.unshift(component);

			if (component instanceof Akimbo.App.Core === false) {
				if (component.meta === undefined) {
					throw '"' + component.name + '" meta property must be defined';
				}

				if (component.meta.selector === undefined) {
					throw '"' + component.name + '" meta property selector must be defined';
				}

				if (component.meta.templateUrl === undefined || component.meta.templateUrl === '') {
					throw '"' + component.name + '" meta property templateUrl must be defined';
				}


				if (component.meta.layout === undefined) {
					component.meta.layout = 'index';
				}

				if (!layoutHasLoaded) {
					$('[data-layout]').load('src/app/layouts/' + component.meta.layout + '.html', function () {
						layoutHasLoaded = true;

						scope.event.broadcast('layout.loaded');
					});
				} else {
					loadTemplateAndInitiateComponent(component);
				}
			}

			scope.event.listen('layout.loaded', function () {
				if (component instanceof Akimbo.App.Core === false) {
					loadTemplateAndInitiateComponent(component);
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
				if (component.unload !== undefined) {
					component.unload();
				}

				$('[' + component.meta.selector + ']').empty().remove();


				component = null;

			});

			componentsLoaded = [];

			$('[data-layout]').empty();
		}
	};

	function loadTemplateAndInitiateComponent(component) {
		$('[' + component.meta.selector + ']').load(component.meta.templateUrl, function () {
			$('a').on('click', function (e) {
				e.preventDefault();
			});

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
		if (component.constructor !== undefined) {
			setTimeout(function () {
				component.constructor(component);
			}, 100);
		}

		if (component.before !== undefined) {
			setTimeout(function () {
				component.before(component);
			}, 100);
		}

		if (component.after !== undefined) {
			setTimeout(function () {
				component.after(component);
			}, 150);
		}

		$('[' + component.meta.selector + ']').fadeIn(200);

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
(function (Akimbo) {
	Akimbo.Config = Config;

	var instance = null;

	function Config() {
		if (instance === null) {
			instance = this;
		}
	}

	Config.prototype = {
		get: function (config) {
			if (config.indexOf('.') !== -1) {
				var pieces = config.split('.');
				var namespace = new Akimbo.App.Config[pieces[0]];

				for (var i = 1; i < pieces.length; i++) {
					if (namespace[pieces[i]] === undefined) {
						throw '"' + config + '" config does not exist';
						break;
					}

					namespace = namespace[pieces[i]];
				}

				return namespace;
			} else {
				return new Akimbo.App.Config[config];
			}
		}
	};
})(akimbo);
(function (Akimbo) {
	Akimbo.Event = Event;

	var listeners = [];

	function Event() {
	}

	Event.prototype = {
		listen: function (event, callback, object) {
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
(function (Akimbo) {
	Akimbo.Router = Router;

	var core = null;
	var busy = false;
	var route = {};
	var path = '';
	var removeClass = true;
	var segments = [];

	function Router() {
		this.ignoreHistory = false;
		this.config = new Akimbo.Config();
		this.component = new Akimbo.Component();
		this.event = new Akimbo.Event();
	}

	Router.prototype = {
		navigate: function (requestedPath, removeClassParam) {
			var scope = this;
			var routeExists = false;
			segments = requestedPath.split('/');
			removeClass = removeClassParam === false ? false : true;

			if (!busy) {
				var routes = scope.config.get('routes');

				for (var i in scope.config.get('routes')) {
					if (requestedPath === routes[i].path) {
						routeExists = true;
						path = requestedPath;
						route = routes[i];

						process(scope);
					}
				}

				if (!routeExists) {
					$.each(scope.config.get('routes'), function () {
						if (this.path.indexOf('{') !== -1) {
							var pathPieces = this.path.split('/');
							var segmentsMatch = true;

							if (pathPieces.length === segments.length) {
								for (var i in pathPieces) {
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

								process(scope);
							}
						}
					});
				}

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

		destroy(scope);
		loadCore(scope);
		loadController(scope);
		loadCoreComponents(scope);

		$(document).on('click', 'a[disabled]', function (e) {
			e.preventDefault();
		});

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

	function destroy(scope) {
		$('*').unbind().off().stop(true, true);

		$(window).off();

		$(document).off();

		scope.event.remove();

		if (core !== null) {
			scope.component.setLayoutHasLoaded(false);

			scope.component.unload();
		}
	}

	function loadCore(scope) {
		core = new scope.component.load(Akimbo.App.Core);

		if (core.constructor !== undefined) {
			core.constructor(core);
		}

		if (core.before !== undefined) {
			core.before(core);
		}
	}

	function loadController(scope) {
		var controller = Akimbo.App.Controllers[route.controller];

		if (controller === undefined) {
			throw 'Akimbo.App.Controllers.' + route.controller + ' does not exist';
		}

		controller = new scope.component.load(Akimbo.App.Controllers[route.controller]);

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

	function loadCoreComponents(scope) {
		scope.event.listen('layout.loaded', function () {
			new scope.component.loadComponents(core.meta.components);

			setTimeout(function () {
				if (core.after !== undefined) {
					core.after(core);
				}
			}, 50);
		});
	}
})(akimbo);
(function (Akimbo) {
	Akimbo.Service = Service;

	function Service() {
		this.listeners = {};

		this.name = '';
		this.serviceUrl = '';
		this.uri = '';
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
		}, this.overrideEvents);

		(function constructor(scope) {
			scope.config = new Akimbo.Config();
			scope.cache = new Akimbo.Cache();
			scope.event = new Akimbo.Event();
		})(this);
	}

	Service.prototype.validate = function () {
		if (this.name === undefined || this.name === null || this.name === '') {
			throw '"this.name" must be supplied.';
		}

		if (this.serviceUrl === undefined || this.serviceUrl === null || this.serviceUrl === '') {
			throw '"this.serviceUrl" must be supplied.';
		}
	};

	Service.prototype.create = function (params, object, overrideEvents) {
		this.validate();

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
		this.validate();

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
		this.validate();

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
		this.validate();

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
		this.validate();

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
(function (Akimbo) {
	Akimbo.Template = Template;

	function Template() {}

	Template.prototype = {
		render: function (data, html, element) {
			var output = html;

			$.each(data, function (key, val) {

				output = output.replace(new RegExp('{{' + key + '}}', 'g'), val);
			});

			element.empty().append(output);

			element.find('a').on('click', function (e) {
				e.preventDefault();
			});

			return output;
		}
	};
})(akimbo);