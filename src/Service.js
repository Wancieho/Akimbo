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
				always: 'create.always'
			},
			read: {
				done: 'read.done',
				fail: 'read.fail',
				always: 'read.always'
			},
			update: {
				done: 'update.done',
				fail: 'update.fail',
				always: 'update.always'
			},
			destroy: {
				done: 'destroy.done',
				fail: 'destroy.fail',
				always: 'destroy.always'
			},
			index: {
				done: 'index.done',
				fail: 'index.fail',
				always: 'index.always'
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
			contentType: params.contentType !== undefined ? params.contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
		}).done(function (response) {
			scope.event.broadcast(events.create.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.create.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.create.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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
			contentType: params.contentType !== undefined ? params.contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
		}).done(function (response) {
			scope.event.broadcast(events.read.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.read.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.read.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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
			contentType: params.contentType !== undefined ? params.contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
		}).done(function (response) {
			scope.event.broadcast(events.update.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.update.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.update.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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
			contentType: params.contentType !== undefined ? params.contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
		}).done(function (response) {
			scope.event.broadcast(events.destroy.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.destroy.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.destroy.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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
			contentType: params.contentType !== undefined ? params.contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
		}).done(function (response) {
			scope.event.broadcast(events.index.done, response, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).fail(function (xhr) {
			scope.event.broadcast(events.index.fail, xhr.responseJSON !== undefined ? xhr.responseJSON : xhr, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
		}).always(function () {
			scope.event.broadcast(events.index.always, null, params.object !== undefined && params.object !== null ? $.extend({}, scope, params.object) : scope);
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