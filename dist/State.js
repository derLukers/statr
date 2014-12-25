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
      if (!(this.isActive && (this.generateRoute(this.currentParameters === this.generateRoute(parameters))))) {
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

//# sourceMappingURL=data:application/json;base64,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QUFBOztpQkFBQTs7T0FuQjhCO0FBQUEsQ0FBbEMsQ0FBQSxDQUFBIiwiZmlsZSI6IlN0YXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lICdTdGF0ZScsIFsnU3RhdGVNYW5hZ2VyJ10sIChTdGF0ZU1hbmFnZXIpIC0+XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGluc2VydFBhcmFtZXRlcnMgPSAoc3RyaW5nLCBwYXJhbWV0ZXJzKS0+XG4gICAgcmVzdWx0ID0gc3RyaW5nXG5cbiAgICBmb3IgcGFyYW1ldGVyLCB2YWx1ZSBvZiBwYXJhbWV0ZXJzXG4gICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSBcIjoje3BhcmFtZXRlcn1cIiwgdmFsdWVcblxuICAgIHJldHVybiByZXN1bHRcblxuICBkZWZlciA9ICgpLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIHJlc3VsdC5wcm9taXNlID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCktPlxuICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlXG4gICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0XG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGNsYXNzIFN0YXRlXG4gICAgaXNBY3RpdmU6IGZhbHNlXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgIFN0YXRlTWFuYWdlci5yZWdpc3RlclN0YXRlIEBcblxuICAgIGluc2VydFBhcmFtZXRlcnM6IGluc2VydFBhcmFtZXRlcnNcblxuICAgIGRvUmVzb2x2ZTogKHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzPXt9KSAtPlxuICAgICAgcmVzdWx0UHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpPT5cbiAgICAgICAgdW5sZXNzIEByZXNvbHZlXG4gICAgICAgICAgcmVzb2x2ZSBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICAgIHJldHVybiByZXN1bHRQcm9taXNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdWJQcm9taXNlTGlzdCA9IFtdXG4gICAgICAgICAgZm9yIG5hbWUsIHJlc29sdmVGdW5jdGlvbiBvZiBAcmVzb2x2ZVxuICAgICAgICAgICAgZGVmZXJyZWQgPSByZXNvbHZlRnVuY3Rpb24gcGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdHNcbiAgICAgICAgICAgIGRlZmVycmVkLm5hbWUgPSBuYW1lXG4gICAgICAgICAgICBzdWJQcm9taXNlTGlzdC5wdXNoIGRlZmVycmVkXG4gICAgICAgICAgKFByb21pc2UuYWxsIHN1YlByb21pc2VMaXN0KS50aGVuIC0+XG4gICAgICAgICAgICBmb3IgaW5kZXgsIHN1YlByb21pc2Ugb2Ygc3ViUHJvbWlzZUxpc3RcbiAgICAgICAgICAgICAgcGFyZW50UmVzb2x2ZVJlc3VsdHNbc3ViUHJvbWlzZS5uYW1lXSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgICAgIHJlc29sdmUgcGFyZW50UmVzb2x2ZVJlc3VsdHNcbiAgICAgIHJldHVybiByZXN1bHRQcm9taXNlXG5cbiAgICBhY3RpdmF0ZTogKHBhcmFtZXRlcnMsIGNoaWxkPW51bGwsIGFjdGl2YXRpb25Qcm9taXNlPWRlZmVyKCkpIC0+XG4gICAgICBpbml0aWFsID0gY2hpbGQgPT0gbnVsbFxuICAgICAgcmVzb2x2ZVByb21pc2UgPSBkZWZlcigpXG5cbiAgICAgIGlmIGluaXRpYWxcbiAgICAgICAgcmVzb2x2ZVByb21pc2UucHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KSAtPlxuICAgICAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuXG4gICAgICB1bmxlc3MgQGN1cnJlbnRDaGlsZCA9PSBjaGlsZFxuICAgICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgICAgQGN1cnJlbnRDaGlsZCA9IGNoaWxkXG5cbiAgICAgIHVubGVzcyBAaXNBY3RpdmUgYW5kIChcbiAgICAgICAgQGdlbmVyYXRlUm91dGUgQGN1cnJlbnRQYXJhbWV0ZXJzID09IEBnZW5lcmF0ZVJvdXRlIHBhcmFtZXRlcnMpXG4gICAgICAgIGlmIEBwYXJlbnRcbiAgICAgICAgICBAcGFyZW50LmFjdGl2YXRlIHBhcmFtZXRlcnMsIEAsIGFjdGl2YXRpb25Qcm9taXNlXG4gICAgICAgICAgICAudGhlbiAocGFyZW50UmVzb2x2ZVJlc3VsdCkgPT5cbiAgICAgICAgICAgICAgQGRvUmVzb2x2ZSBwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0XG4gICAgICAgICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgICAgICAgICAgICBAcHJldmlvdXNSZXNvbHZlUmVzdWx0ID0gcmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZG9SZXNvbHZlIHBhcmFtZXRlcnNcbiAgICAgICAgICAudGhlbiAocmVzb2x2ZVJlc3VsdCkgPT5cbiAgICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSByZXNvbHZlUmVzdWx0XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIHJlc29sdmVSZXN1bHRcblxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIEBwcmV2aW91c1Jlc29sdmVSZXN1bHRcblxuICAgICAgYWN0aXZhdGlvblByb21pc2UucHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KSA9PlxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcbiAgICAgICAgQGlzQWN0aXZlID0gdHJ1ZVxuICAgICAgICBAb25BY3RpdmF0ZT8gcGFyYW1ldGVycywgcmVzb2x2ZVJlc3VsdFxuXG4gICAgICBAY3VycmVudFBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzXG4gICAgICByZXR1cm4gcmVzb2x2ZVByb21pc2UucHJvbWlzZVxuXG4gICAgZGVhY3RpdmF0ZTogLT5cbiAgICAgIEBpc0FjdGl2ZSA9IGZhbHNlXG4gICAgICBAb25EZWFjdGl2YXRlPygpXG4gICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgIEBjdXJyZW50Q2hpbGQgPSBudWxsXG5cbiAgICBnZW5lcmF0ZVJvdXRlOiAocGFyYW1ldGVycykgLT5cbiAgICAgIFwiI3tbQHBhcmVudC5nZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpICtcbiAgICAgICAgICAgICcvJyBpZiBAcGFyZW50Py5nZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpLmxlbmd0aF19XCIgK1xuICAgICAgXCIje1tpbnNlcnRQYXJhbWV0ZXJzKEByb3V0ZSwgcGFyYW1ldGVycykgaWYgQHJvdXRlXX1cIlxuXG4gICAgZ2VuZXJhdGVSb3V0ZVN0cmluZzogLT5cbiAgICAgIFwiI3tbXCIje0BwYXJlbnQuZ2VuZXJhdGVSb3V0ZVN0cmluZygpfSN7Jy8nIGlmIEByb3V0ZX1cbiAgICAgIFwiaWYgQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZVN0cmluZygpLmxlbmd0aF19I3tbQHJvdXRlXX1cIlxuXG4gICAgZ2VuZXJhdGVOYW1lOiAtPlxuICAgICAgXCIje1tAcGFyZW50LmdlbmVyYXRlTmFtZSgpICsgJy4nIGlmIEBwYXJlbnQ/LnN0YXRlbmFtZV19I3tAc3RhdGVuYW1lfVwiXG5cbiAgICBnZXRQYXJlbnRDaGFpbjogLT5cbiAgICAgIGNoYWluID0gQHBhcmVudD8uZ2V0UGFyZW50Q2hhaW4oKSBvciBbXVxuICAgICAgY2hhaW4ucHVzaCBAXG4gICAgICByZXR1cm4gY2hhaW5cbiJdfQ==