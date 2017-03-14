(function (root) {
	root.Akimbo.Router = Router;

	var core = null;
	var controller = null;
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
		loadController.apply(scope);
		loadCoreComponents.apply(scope);

		//prevent default anchor click if it has disabled attribute
		$(document).on('click', 'a[disabled]', function (e) {
			e.preventDefault();
		});

		document.addEventListener('click', function (e) {
			if ($(e.target).closest('a[disabled]').length) {
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		}, true);

		busy = false;
	}

	function destroy() {
		//remove previous page element bindings
		$('*').unbind().off().stop(true, true);

		$(window).off();

		$(document).off();

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

	function loadController() {
		var controller = root.App.Controllers[route.controller];

		if (controller === undefined) {
			throw 'root.App.Controllers.' + route.controller + ' does not exist';
		}

		controller = new this.component.load(root.App.Controllers[route.controller]);

		//remove body class and add if controller meta property specified
		if (removeClass) {
			$('body').removeClass();
		}

		if (controller.meta !== undefined) {
			if (controller.meta.templateClass !== undefined) {
				$('body').addClass(controller.meta.templateClass);
			}
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
})(protected);