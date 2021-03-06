//#TODO: add jQuery as param to all classes
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
		this.helper = new Akimbo.Helper();
	}

	Router.prototype = {
		navigate: function (requestedPath, removeClassParam) {
			var scope = this;
			var routeExists = false;
			var routes = scope.config.get('routes');

			segments = requestedPath.split('/');
			removeClass = removeClassParam === false ? false : true;
			//#TODO!: pass segments to ALL controllers and child components instead of using cache
			scope.cache.set('segments', segments);

			for (var i in scope.config.get('routes')) {
				//requested path matches a path in the routes config exactly
				if (requestedPath.replace(basePath(scope), '') === routes[i].path) {
					routeExists = true;
					path = requestedPath.replace(basePath(scope), '');
					route = routes[i];

					process(scope);
				}
			}

			//if no exact match was found then check if requested path matches a {dynamic} path
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
							//#TODO: create unit test
							//#TODO!: test as placing in a folder could affect this
							path = requestedPath.replace(basePath(scope), '');
							route = this;

							process(scope);
						}
					}
				});
			}

			//if a route is still not found then the URI is not something that exists inside Config.routes
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
	}

	function destroy(scope) {
		//remove previous page element bindings
		$('*').unbind().off().stop(true, true);

		$(window).off();

		$(document).off();

		//remove previous page events
		scope.event.remove();

		//core has been loaded then destroy
		if (core !== null) {
			//reset Component global "layout has loaded" var to false as we are loading a new page
			scope.component.setLayoutHasLoaded(false);

			//unload all previously loaded components
			scope.component.unload();
		}
	}

	function loadCore(scope) {
		//#TODO: throw error if Core doesnt exist
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
		var instance = new scope.component.load(route.controller);

		//remove body class and add if controller meta property specified
		if (removeClass) {
			$('body').removeClass();
		}

		if (instance.meta !== undefined) {
			if (instance.meta.templateClass !== undefined) {
				$('body').addClass(instance.meta.templateClass);
			}
		}

		if ((history.length > 1 || (history.length === 1 && path !== '')) && !scope.ignoreHistory && window.location.pathname.replace('/', '') !== path) {
			path = path === '' ? '/' + basePath(scope) : path;

			history.pushState({page: path}, null, path);
		}

		//only load core once the controller has loaded
		new scope.component.loadComponents(core.meta.components);
	}

	function basePath(scope) {
		return scope.config.get('settings.basePath') !== null ? scope.config.get('settings.basePath') + '/' : '';
	}
})(akimbo, jQuery);