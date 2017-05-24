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

	Akimbo.start = function () {
		new Akimbo.Init();
	};
})(akimbo);

(function (Akimbo) {
	Akimbo.Init = Init;

	var instance = null;

	function Init() {
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
		instance.router.navigate(window.location.protocol.indexOf('http') !== -1 ? window.location.pathname.replace(new Akimbo.Config().get('settings.basePath') !== null ? '/' + new Akimbo.Config().get('settings.basePath') + '/' : '/', '') : '');
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
			if (index !== undefined) {
				delete data[index];
			} else {
				data = {};
			}
		}
	};
})(akimbo);

(function (Akimbo, $) {
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

			component.instance = JSON.parse(JSON.stringify(component));

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
					$.ajaxSetup({async: false});

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
		$('[' + component.meta.selector + ']').load(component.meta.templateUrl + '?' + new Date().getTime(), function () {
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
})(akimbo, jQuery);
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
				var namespace = Akimbo.App.Config[pieces[0]];

				if (namespace === undefined) {
					return null;
				}

				var namespaces = new namespace;

				for (var i = 1; i < pieces.length; i++) {
					if (namespaces[pieces[i]] === undefined) {
						return null;
					}

					namespaces = namespaces[pieces[i]];
				}

				return namespaces;
			} else {
				var chunk = Akimbo.App.Config[config];

				if (chunk === undefined) {
					return null;
				}

				return new chunk;
			}
		}
	};
})(akimbo);
(function (Akimbo, $) {
	Akimbo.Event = Event;

	var listeners = [];

	function Event() {}

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
})(akimbo, jQuery);
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

(function (Akimbo, $) {
	Akimbo.Router = Router;

	var core = null;
	var route = {};
	var path = '';
	var removeClass = true;
	var segments = [];

	function Router() {
		this.ignoreHistory = false;
		this.config = new Akimbo.Config();
		this.component = new Akimbo.Component();
		this.event = new Akimbo.Event();
		this.cache = new Akimbo.Cache();
	}

	Router.prototype = {
		navigate: function (requestedPath, removeClassParam) {
			var scope = this;
			var routeExists = false;
			var routes = scope.config.get('routes');

			segments = requestedPath.split('/');
			removeClass = removeClassParam === false ? false : true;
			scope.cache.set('segments', segments);

			for (var i in scope.config.get('routes')) {
				if (requestedPath.replace(basePath(scope), '') === routes[i].path) {
					routeExists = true;
					path = requestedPath.replace(basePath(scope), '');
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
							path = requestedPath.replace(basePath(scope), '');
							route = this;

							process(scope);
						}
					}
				});
			}

			if (!routeExists) {
				throw '"' + requestedPath + '" route not found';
			}
		},
		isProtectedRoute: function () {
			return route.protected;
		}
	};

	function process(scope) {
		destroy(scope);
		loadCore(scope);
		loadController(scope);

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

		if (core.listeners !== undefined) {
			core.listeners(core);
		}

		if (core.events !== undefined) {
			core.events(core);
		}

		if (core.init !== undefined) {
			core.init(core);
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
			path = path === '' ? '/' + basePath(scope) : path;

			history.pushState({page: path}, null, path);
		}

		new scope.component.loadComponents(core.meta.components);
	}

	function basePath(scope) {
		return scope.config.get('settings.basePath') !== null ? scope.config.get('settings.basePath') + '/' : '';
	}
})(akimbo, jQuery);
(function (Akimbo, $) {
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

	Service.prototype.create = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.create = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'POST',
			data: params.data,
			headers: params.headers,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.create.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.create.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.create.complete, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		});
	};

	Service.prototype.read = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.read = $.ajax({
			url: this.serviceUrl + '/' + this.uri + '/' + (params.identifier !== undefined ? params.identifier : 'read'),
			type: 'GET',
			data: params.data,
			headers: params.headers,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.read.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.read.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.read.complete, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		});
	};

	Service.prototype.update = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.update = $.ajax({
			url: this.serviceUrl + '/' + this.uri + (params.identifier !== undefined ? '/' + params.identifier : ''),
			type: 'PUT',
			data: params.data,
			headers: params.headers,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.update.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.update.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.update.complete, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		});
	};

	Service.prototype.destroy = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.update = $.ajax({
			url: this.serviceUrl + '/' + this.uri + (params.identifier !== undefined ? '/' + params.identifier : ''),
			type: 'DELETE',
			data: params.data,
			headers: params.headers,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.destroy.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.destroy.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.destroy.complete, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		});
	};

	Service.prototype.index = function (params) {
		this.validate();

		var scope = this;
		var events = $.extend(true, this.events, params.overrideEvents);

		this.listeners.index = $.ajax({
			url: this.serviceUrl + '/' + this.uri,
			type: 'GET',
			data: params.data,
			headers: params.headers,
			contentType: 'application/json'
		}).done(function (response) {
			scope.event.broadcast(events.index.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.index.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).complete(function () {
			scope.event.broadcast(events.index.complete, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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
})(akimbo, jQuery);
(function (Akimbo, $) {
	Akimbo.Test = Test;

	function Test() {}

	Test.prototype = {
		component: function (classzor) {
			this.component = new classzor();

			if (this.component.meta === undefined) {
				throw '"' + this.component.name + '" meta property must be defined';
			}

			if (this.component.meta.constructor === undefined) {
				throw '"' + this.component.name.constructor + '" constructor must be defined';
			}

			$.ajaxSetup({async: false});

			$('body > div').not('#qunit').remove();

			$('body').append('<div ' + this.component.meta.selector + ' style="display:none"></div>');

			$('[' + this.component.meta.selector + ']').load('../demo/' + this.component.meta.templateUrl + '?' + new Date().getTime(), function () {});

			$.ajaxSetup({async: true});

			this.component.instance = JSON.parse(JSON.stringify(this.component));

			this.component.constructor(this.component);

			if (this.component.listeners !== undefined) {
				this.component.listeners(this.component);
			}

			if (this.component.events !== undefined) {
				this.component.events(this.component);
			}

			return this.component;
		}
	};
})(akimbo, jQuery);