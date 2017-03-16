(function (akimbo) {
	akimbo.Service = Service;

	function Service(params) {
		if (params.name === undefined) {
			throw 'Service name param must be specified';
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
		})(akimbo);
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