define('State', ['StateManager'], function(StateManager) {
  'use strict';
  var State, defer, insertParameters;
  insertParameters = function(string, parameters) {
    var parameter, result, value;
    result = string;
    for (parameter in parameters) {
      value = parameters[parameter];
      result = result.replace(":" + parameter, value);
    }
    return result;
  };
  defer = function() {
    var result;
    result = {};
    result.promise = new Promise(function(resolve, reject) {
      result.resolve = resolve;
      return result.reject = reject;
    });
    return result;
  };
  return State = (function() {
    State.prototype.isActive = false;

    function State() {
      StateManager.registerState(this);
    }

    State.prototype.insertParameters = insertParameters;

    State.prototype.doResolve = function(parameters, parentResolveResults) {
      var resultPromise;
      if (parentResolveResults == null) {
        parentResolveResults = {};
      }
      resultPromise = new Promise((function(_this) {
        return function(resolve, reject) {
          var deferred, name, resolveFunction, subPromiseList, _ref;
          if (!_this.resolve) {
            resolve(parentResolveResults);
            return resultPromise;
          } else {
            subPromiseList = [];
            _ref = _this.resolve;
            for (name in _ref) {
              resolveFunction = _ref[name];
              deferred = resolveFunction(parameters, parentResolveResults);
              deferred.name = name;
              subPromiseList.push(deferred);
            }
            return (Promise.all(subPromiseList)).then(function() {
              var index, subPromise;
              for (index in subPromiseList) {
                subPromise = subPromiseList[index];
                parentResolveResults[subPromise.name] = arguments[index];
              }
              return resolve(parentResolveResults);
            });
          }
        };
      })(this));
      return resultPromise;
    };

    State.prototype.activate = function(parameters, child, activationPromise) {
      var initial, resolvePromise, _ref;
      if (child == null) {
        child = null;
      }
      if (activationPromise == null) {
        activationPromise = defer();
      }
      initial = child === null;
      resolvePromise = defer();
      if (initial) {
        resolvePromise.promise.then(function(resolveResult) {
          return activationPromise.resolve(resolveResult);
        });
      }
      if (this.currentChild !== child) {
        if ((_ref = this.currentChild) != null) {
          _ref.deactivate();
        }
        this.currentChild = child;
      }
      if (!(this.isActive && this.generateRoute(this.currentParameters) === this.generateRoute(parameters))) {
        if (this.parent) {
          this.parent.activate(parameters, this, activationPromise).then((function(_this) {
            return function(parentResolveResult) {
              return _this.doResolve(parameters, parentResolveResult).then(function(resolveResult) {
                _this.previousResolveResult = resolveResult;
                return resolvePromise.resolve(resolveResult);
              });
            };
          })(this));
        } else {
          this.doResolve(parameters).then((function(_this) {
            return function(resolveResult) {
              _this.previousResolveResult = resolveResult;
              return resolvePromise.resolve(resolveResult);
            };
          })(this));
        }
      } else {
        resolvePromise.resolve(this.previousResolveResult);
      }
      activationPromise.promise.then((function(_this) {
        return function(resolveResult) {
          _this.currentChild = child;
          _this.isActive = true;
          return typeof _this.onActivate === "function" ? _this.onActivate(parameters, resolveResult) : void 0;
        };
      })(this));
      this.currentParameters = parameters;
      return resolvePromise.promise;
    };

    State.prototype.deactivate = function() {
      var _ref;
      this.isActive = false;
      if (typeof this.onDeactivate === "function") {
        this.onDeactivate();
      }
      if ((_ref = this.currentChild) != null) {
        _ref.deactivate();
      }
      return this.currentChild = null;
    };

    State.prototype.generateRoute = function(parameters) {
      var _ref;
      return ("" + [((_ref = this.parent) != null ? _ref.generateRoute(parameters).length : void 0) ? this.parent.generateRoute(parameters) + '/' : void 0]) + ("" + [this.route ? insertParameters(this.route, parameters) : void 0]);
    };

    State.prototype.generateRouteString = function() {
      var _ref;
      return "" + [((_ref = this.parent) != null ? _ref.generateRouteString().length : void 0) ? "" + (this.parent.generateRouteString()) + (this.route ? '/' : void 0) : void 0] + [this.route];
    };

    State.prototype.generateName = function() {
      var _ref;
      return "" + [((_ref = this.parent) != null ? _ref.statename : void 0) ? this.parent.generateName() + '.' : void 0] + this.statename;
    };

    State.prototype.getParentChain = function() {
      var chain, _ref;
      chain = ((_ref = this.parent) != null ? _ref.getParentChain() : void 0) || [];
      chain.push(this);
      return chain;
    };

    return State;

  })();
});

//# sourceMappingURL=data:application/json;base64,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O09BbkI4QjtBQUFBLENBQWxDLENBQUEsQ0FBQSIsImZpbGUiOiJTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSAnU3RhdGUnLCBbJ1N0YXRlTWFuYWdlciddLCAoU3RhdGVNYW5hZ2VyKSAtPlxuICAndXNlIHN0cmljdCdcblxuICBpbnNlcnRQYXJhbWV0ZXJzID0gKHN0cmluZywgcGFyYW1ldGVycyktPlxuICAgIHJlc3VsdCA9IHN0cmluZ1xuXG4gICAgZm9yIHBhcmFtZXRlciwgdmFsdWUgb2YgcGFyYW1ldGVyc1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UgXCI6I3twYXJhbWV0ZXJ9XCIsIHZhbHVlXG5cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZGVmZXIgPSAoKS0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpLT5cbiAgICAgIHJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdFxuICAgIHJldHVybiByZXN1bHRcblxuICBjbGFzcyBTdGF0ZVxuICAgIGlzQWN0aXZlOiBmYWxzZVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBTdGF0ZU1hbmFnZXIucmVnaXN0ZXJTdGF0ZSBAXG5cbiAgICBpbnNlcnRQYXJhbWV0ZXJzOiBpbnNlcnRQYXJhbWV0ZXJzXG5cbiAgICBkb1Jlc29sdmU6IChwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0cz17fSkgLT5cbiAgICAgIHJlc3VsdFByb21pc2UgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KT0+XG4gICAgICAgIHVubGVzcyBAcmVzb2x2ZVxuICAgICAgICAgIHJlc29sdmUgcGFyZW50UmVzb2x2ZVJlc3VsdHNcbiAgICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3ViUHJvbWlzZUxpc3QgPSBbXVxuICAgICAgICAgIGZvciBuYW1lLCByZXNvbHZlRnVuY3Rpb24gb2YgQHJlc29sdmVcbiAgICAgICAgICAgIGRlZmVycmVkID0gcmVzb2x2ZUZ1bmN0aW9uIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgICAgICBkZWZlcnJlZC5uYW1lID0gbmFtZVxuICAgICAgICAgICAgc3ViUHJvbWlzZUxpc3QucHVzaCBkZWZlcnJlZFxuICAgICAgICAgIChQcm9taXNlLmFsbCBzdWJQcm9taXNlTGlzdCkudGhlbiA9PlxuICAgICAgICAgICAgZm9yIGluZGV4LCBzdWJQcm9taXNlIG9mIHN1YlByb21pc2VMaXN0XG4gICAgICAgICAgICAgIHBhcmVudFJlc29sdmVSZXN1bHRzW3N1YlByb21pc2UubmFtZV0gPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgICAgICByZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZVxuXG4gICAgYWN0aXZhdGU6IChwYXJhbWV0ZXJzLCBjaGlsZD1udWxsLCBhY3RpdmF0aW9uUHJvbWlzZT1kZWZlcigpKSAtPlxuICAgICAgaW5pdGlhbCA9IGNoaWxkID09IG51bGxcbiAgICAgIHJlc29sdmVQcm9taXNlID0gZGVmZXIoKVxuXG4gICAgICBpZiBpbml0aWFsXG4gICAgICAgIHJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiAocmVzb2x2ZVJlc3VsdCkgLT5cbiAgICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlIHJlc29sdmVSZXN1bHRcblxuICAgICAgdW5sZXNzIEBjdXJyZW50Q2hpbGQgPT0gY2hpbGRcbiAgICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuXG4gICAgICB1bmxlc3MgQGlzQWN0aXZlIGFuZCBAZ2VuZXJhdGVSb3V0ZShAY3VycmVudFBhcmFtZXRlcnMpID09IEBnZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpXG4gICAgICAgIGlmIEBwYXJlbnRcbiAgICAgICAgICBAcGFyZW50LmFjdGl2YXRlIHBhcmFtZXRlcnMsIEAsIGFjdGl2YXRpb25Qcm9taXNlXG4gICAgICAgICAgLnRoZW4gKHBhcmVudFJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgICAgICBAZG9SZXNvbHZlIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgIC50aGVuIChyZXNvbHZlUmVzdWx0KSA9PlxuICAgICAgICAgICAgICBAcHJldmlvdXNSZXNvbHZlUmVzdWx0ID0gcmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIHJlc29sdmVSZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkb1Jlc29sdmUgcGFyYW1ldGVyc1xuICAgICAgICAgIC50aGVuIChyZXNvbHZlUmVzdWx0KSA9PlxuICAgICAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuXG4gICAgICBlbHNlXG4gICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdFxuXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZS5wcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuICAgICAgICBAaXNBY3RpdmUgPSB0cnVlXG4gICAgICAgIEBvbkFjdGl2YXRlPyBwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0XG5cbiAgICAgIEBjdXJyZW50UGFyYW1ldGVycyA9IHBhcmFtZXRlcnNcbiAgICAgIHJldHVybiByZXNvbHZlUHJvbWlzZS5wcm9taXNlXG5cbiAgICBkZWFjdGl2YXRlOiAtPlxuICAgICAgQGlzQWN0aXZlID0gZmFsc2VcbiAgICAgIEBvbkRlYWN0aXZhdGU/KClcbiAgICAgIEBjdXJyZW50Q2hpbGQ/LmRlYWN0aXZhdGUoKVxuICAgICAgQGN1cnJlbnRDaGlsZCA9IG51bGxcblxuICAgIGdlbmVyYXRlUm91dGU6IChwYXJhbWV0ZXJzKSAtPlxuICAgICAgXCIje1tAcGFyZW50LmdlbmVyYXRlUm91dGUocGFyYW1ldGVycykgKyAnLycgaWYgQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKS5sZW5ndGhdfVwiICtcbiAgICAgIFwiI3tbaW5zZXJ0UGFyYW1ldGVycyhAcm91dGUsIHBhcmFtZXRlcnMpIGlmIEByb3V0ZV19XCJcblxuICAgIGdlbmVyYXRlUm91dGVTdHJpbmc6IC0+XG4gICAgICBcIiN7W1wiI3tAcGFyZW50LmdlbmVyYXRlUm91dGVTdHJpbmcoKX0jeycvJyBpZiBAcm91dGV9XCIgaWYgQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZVN0cmluZygpLmxlbmd0aF19I3tbQHJvdXRlXX1cIlxuXG4gICAgZ2VuZXJhdGVOYW1lOiAtPlxuICAgICAgXCIje1tAcGFyZW50LmdlbmVyYXRlTmFtZSgpICsgJy4nIGlmIEBwYXJlbnQ/LnN0YXRlbmFtZV19I3tAc3RhdGVuYW1lfVwiXG5cbiAgICBnZXRQYXJlbnRDaGFpbjogLT5cbiAgICAgIGNoYWluID0gQHBhcmVudD8uZ2V0UGFyZW50Q2hhaW4oKSBvciBbXVxuICAgICAgY2hhaW4ucHVzaCBAXG4gICAgICByZXR1cm4gY2hhaW5cbiJdfQ==