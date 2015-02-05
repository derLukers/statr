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
      var deferred, name, resolveFunction, resultPromise, subPromiseList, _ref;
      if (parentResolveResults == null) {
        parentResolveResults = {};
      }
      resultPromise = defer();
      if (!this.resolve) {
        resultPromise.resolve(parentResolveResults);
        return resultPromise.promise;
      } else {
        subPromiseList = [];
        _ref = this.resolve;
        for (name in _ref) {
          resolveFunction = _ref[name];
          deferred = resolveFunction(parameters, parentResolveResults);
          deferred.name = name;
          subPromiseList.push(deferred);
        }
        Promise.all(subPromiseList).then(function() {
          var index, subPromise;
          for (index in subPromiseList) {
            subPromise = subPromiseList[index];
            parentResolveResults[subPromise.name] = arguments[index];
          }
          this.previousResolveResult = parentResolveResults;
          return resultPromise.resolve(parentResolveResults);
        });
      }
      return resultPromise.promise;
    };

    State.prototype.activate = function(parameters, child, resolvePromise) {
      var activationPromise, initial, innerResolvePromise, parentActivateResult, _ref;
      if (child == null) {
        child = null;
      }
      if (resolvePromise == null) {
        resolvePromise = defer();
      }
      initial = child === null;
      innerResolvePromise = defer();
      activationPromise = defer();
      if (this.currentChild !== child) {
        if ((_ref = this.currentChild) != null) {
          _ref.deactivate();
        }
        this.currentChild = child;
      }
      if (initial) {
        innerResolvePromise.promise.then(resolvePromise.resolve, resolvePromise.reject);
      }
      innerResolvePromise.promise.then((function(_this) {
        return function() {
          return _this.previousResolveResult = resolveResult;
        };
      })(this));
      resolvePromise.promise.then((function(_this) {
        return function() {
          _this.currentChild = child;
          _this.isActive = true;
          return _this.currentParams = parameters;
        };
      })(this));
      if (!(this.isActive && this.paramsUnchanged(parameters))) {
        if (this.parent) {
          parentActivateResult = this.parent.activate(parameters, this, resolvePromise);
          parentActivateResult[0].then((function(_this) {
            return function(resolveResults) {
              return _this.doResolve(parameters, resolveResults).then(innerResolvePromise.resolve, innerResolvePromise.reject);
            };
          })(this));
          parentActivateResult[1].then((function(_this) {
            return function(resolveResults) {
              if (typeof _this.onActivate === "function") {
                _this.onActivate(parameters, resolveResults);
              }
              return activationPromise.resolve(resolveResults);
            };
          })(this));
        } else {
          this.doResolve(parameters).then(innerResolvePromise.resolve);
          resolvePromise.promise.then((function(_this) {
            return function(resolveResults) {
              if (typeof _this.onActivate === "function") {
                _this.onActivate(parameters, resolveResults);
              }
              return activationPromise.resolve(resolveResults);
            };
          })(this));
        }
      } else {
        innerResolvePromise.resolve(this.previousResolveResult);
        resolvePromise.promise.then(activationPromise.resolve, activationPromise.reject);
      }
      if (!initial) {
        return [innerResolvePromise.promise, activationPromise.promise];
      }
      return activationPromise.promise;
    };

    State.prototype.paramsUnchanged = function(params) {
      var name, value;
      return [
        (function() {
          var _i, _len, _ref, _results;
          _ref = this.currentParams;
          _results = [];
          for (value = _i = 0, _len = _ref.length; _i < _len; value = ++_i) {
            name = _ref[value];
            _results.push(params[name] === value);
          }
          return _results;
        }).call(this)
      ].every(function(x) {
        return x === true;
      });
    };

    State.prototype.deactivate = function() {
      var _ref;
      this.isActive = false;
      if ((_ref = this.currentChild) != null) {
        _ref.deactivate();
      }
      if (typeof this.onDeactivate === "function") {
        this.onDeactivate();
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

//# sourceMappingURL=data:application/json;base64,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QUFBLEtBQXpDLEdBQUEsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLEtBQWxCLEVBQXlCLFVBQXpCLENBQUEsR0FBQSxNQUFELENBQUgsRUFIYTtJQUFBLENBMUVmLENBQUE7O0FBQUEsb0JBK0VBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLElBQUE7YUFBQSxFQUFBLEdBQUcscUNBQ1EsQ0FBRSxtQkFBVCxDQUFBLENBQThCLENBQUMsZ0JBRC9CLEdBQUEsRUFBQSxHQUFFLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUFBLENBQUQsQ0FBRixHQUFrQyxDQUFRLElBQUMsQ0FBQSxLQUFSLEdBQUEsR0FBQSxHQUFBLE1BQUQsQ0FBbEMsR0FBQSxNQUFELENBQUgsR0FDNkMsQ0FBQyxJQUFDLENBQUEsS0FBRixFQUYxQjtJQUFBLENBL0VyQixDQUFBOztBQUFBLG9CQW1GQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osVUFBQSxJQUFBO2FBQUEsRUFBQSxHQUFHLHFDQUF3QyxDQUFFLG1CQUF6QyxHQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsR0FBekIsR0FBQSxNQUFELENBQUgsR0FBMEQsSUFBQyxDQUFBLFVBRC9DO0lBQUEsQ0FuRmQsQ0FBQTs7QUFBQSxvQkFzRkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLFdBQUE7QUFBQSxNQUFBLEtBQUEsdUNBQWUsQ0FBRSxjQUFULENBQUEsV0FBQSxJQUE2QixFQUFyQyxDQUFBO0FBQUEsTUFDQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FEQSxDQUFBO0FBRUEsYUFBTyxLQUFQLENBSGM7SUFBQSxDQXRGaEIsQ0FBQTs7aUJBQUE7O09BbkI4QjtBQUFBLENBQWxDLENBQUEsQ0FBQSIsImZpbGUiOiJTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSAnU3RhdGUnLCBbJ1N0YXRlTWFuYWdlciddLCAoU3RhdGVNYW5hZ2VyKSAtPlxuICAndXNlIHN0cmljdCdcblxuICBpbnNlcnRQYXJhbWV0ZXJzID0gKHN0cmluZywgcGFyYW1ldGVycyktPlxuICAgIHJlc3VsdCA9IHN0cmluZ1xuXG4gICAgZm9yIHBhcmFtZXRlciwgdmFsdWUgb2YgcGFyYW1ldGVyc1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UgXCI6I3twYXJhbWV0ZXJ9XCIsIHZhbHVlXG5cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZGVmZXIgPSAoKS0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpLT5cbiAgICAgIHJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdFxuICAgIHJldHVybiByZXN1bHRcblxuICBjbGFzcyBTdGF0ZVxuICAgIGlzQWN0aXZlOiBmYWxzZVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBTdGF0ZU1hbmFnZXIucmVnaXN0ZXJTdGF0ZSBAXG5cbiAgICBpbnNlcnRQYXJhbWV0ZXJzOiBpbnNlcnRQYXJhbWV0ZXJzXG5cbiAgICBkb1Jlc29sdmU6IChwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0cz17fSkgLT5cbiAgICAgIHJlc3VsdFByb21pc2UgPSBkZWZlcigpXG4gICAgICB1bmxlc3MgQHJlc29sdmVcbiAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlKHBhcmVudFJlc29sdmVSZXN1bHRzKVxuICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZS5wcm9taXNlXG4gICAgICBlbHNlXG4gICAgICAgIHN1YlByb21pc2VMaXN0ID0gW11cbiAgICAgICAgZm9yIG5hbWUsIHJlc29sdmVGdW5jdGlvbiBvZiBAcmVzb2x2ZVxuICAgICAgICAgIGRlZmVycmVkID0gcmVzb2x2ZUZ1bmN0aW9uIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgICAgZGVmZXJyZWQubmFtZSA9IG5hbWVcbiAgICAgICAgICBzdWJQcm9taXNlTGlzdC5wdXNoIGRlZmVycmVkXG4gICAgICAgIFByb21pc2UuYWxsKHN1YlByb21pc2VMaXN0KS50aGVuIC0+XG4gICAgICAgICAgZm9yIGluZGV4LCBzdWJQcm9taXNlIG9mIHN1YlByb21pc2VMaXN0XG4gICAgICAgICAgICBwYXJlbnRSZXNvbHZlUmVzdWx0c1tzdWJQcm9taXNlLm5hbWVdID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICAgIHJlc3VsdFByb21pc2UucmVzb2x2ZShwYXJlbnRSZXNvbHZlUmVzdWx0cylcbiAgICAgIHJldHVybiByZXN1bHRQcm9taXNlLnByb21pc2VcblxuICAgIGFjdGl2YXRlOiAocGFyYW1ldGVycywgY2hpbGQ9bnVsbCwgcmVzb2x2ZVByb21pc2U9ZGVmZXIoKSktPlxuICAgICAgaW5pdGlhbCA9IGNoaWxkID09IG51bGxcbiAgICAgIGlubmVyUmVzb2x2ZVByb21pc2UgPSBkZWZlcigpXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGRlZmVyKClcblxuICAgICAgdW5sZXNzIEBjdXJyZW50Q2hpbGQgPT0gY2hpbGRcbiAgICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuXG4gICAgICBpZiBpbml0aWFsXG4gICAgICAgIGlubmVyUmVzb2x2ZVByb21pc2UucHJvbWlzZS50aGVuIHJlc29sdmVQcm9taXNlLnJlc29sdmUsIHJlc29sdmVQcm9taXNlLnJlamVjdFxuXG4gICAgICBpbm5lclJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiAoKT0+XG4gICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSByZXNvbHZlUmVzdWx0XG5cbiAgICAgIHJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiAoKT0+XG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuICAgICAgICBAaXNBY3RpdmUgPSB0cnVlXG4gICAgICAgIEBjdXJyZW50UGFyYW1zID0gcGFyYW1ldGVyc1xuXG4gICAgICB1bmxlc3MgQGlzQWN0aXZlIGFuZCBAcGFyYW1zVW5jaGFuZ2VkKHBhcmFtZXRlcnMpXG4gICAgICAgIGlmIEBwYXJlbnRcbiAgICAgICAgICBwYXJlbnRBY3RpdmF0ZVJlc3VsdCA9IEBwYXJlbnQuYWN0aXZhdGUocGFyYW1ldGVycywgQCwgcmVzb2x2ZVByb21pc2UpXG4gICAgICAgICAgcGFyZW50QWN0aXZhdGVSZXN1bHRbMF0udGhlbiAocmVzb2x2ZVJlc3VsdHMpPT5cbiAgICAgICAgICAgIEBkb1Jlc29sdmUocGFyYW1ldGVycywgcmVzb2x2ZVJlc3VsdHMpLnRoZW4gaW5uZXJSZXNvbHZlUHJvbWlzZS5yZXNvbHZlLCBpbm5lclJlc29sdmVQcm9taXNlLnJlamVjdFxuICAgICAgICAgIHBhcmVudEFjdGl2YXRlUmVzdWx0WzFdLnRoZW4gKHJlc29sdmVSZXN1bHRzKT0+XG4gICAgICAgICAgICBAb25BY3RpdmF0ZT8ocGFyYW1ldGVycywgcmVzb2x2ZVJlc3VsdHMpXG4gICAgICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlKHJlc29sdmVSZXN1bHRzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRvUmVzb2x2ZShwYXJhbWV0ZXJzKS50aGVuIGlubmVyUmVzb2x2ZVByb21pc2UucmVzb2x2ZVxuICAgICAgICAgIHJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiAocmVzb2x2ZVJlc3VsdHMpPT5cbiAgICAgICAgICAgIEBvbkFjdGl2YXRlPyhwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0cylcbiAgICAgICAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnJlc29sdmUocmVzb2x2ZVJlc3VsdHMpXG4gICAgICBlbHNlXG4gICAgICAgIGlubmVyUmVzb2x2ZVByb21pc2UucmVzb2x2ZSBAcHJldmlvdXNSZXNvbHZlUmVzdWx0XG4gICAgICAgIHJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlLCBhY3RpdmF0aW9uUHJvbWlzZS5yZWplY3RcblxuICAgICAgdW5sZXNzIGluaXRpYWxcbiAgICAgICAgcmV0dXJuIFtpbm5lclJlc29sdmVQcm9taXNlLnByb21pc2UsIGFjdGl2YXRpb25Qcm9taXNlLnByb21pc2VdXG4gICAgICByZXR1cm4gYWN0aXZhdGlvblByb21pc2UucHJvbWlzZVxuXG4gICAgcGFyYW1zVW5jaGFuZ2VkOiAocGFyYW1zKS0+IFtwYXJhbXNbbmFtZV0gPT0gdmFsdWUgZm9yIG5hbWUsIHZhbHVlIGluIEBjdXJyZW50UGFyYW1zXS5ldmVyeSAoeCktPng9PXRydWVcblxuICAgIGRlYWN0aXZhdGU6IC0+XG4gICAgICBAaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICBAb25EZWFjdGl2YXRlPygpXG4gICAgICBAY3VycmVudENoaWxkID0gbnVsbFxuXG4gICAgZ2VuZXJhdGVSb3V0ZTogKHBhcmFtZXRlcnMpIC0+XG4gICAgICBcIiN7W0BwYXJlbnQuZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKSArXG4gICAgICAgICAgICAnLycgaWYgQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKS5sZW5ndGhdfVwiICtcbiAgICAgIFwiI3tbaW5zZXJ0UGFyYW1ldGVycyhAcm91dGUsIHBhcmFtZXRlcnMpIGlmIEByb3V0ZV19XCJcblxuICAgIGdlbmVyYXRlUm91dGVTdHJpbmc6IC0+XG4gICAgICBcIiN7W1wiI3tAcGFyZW50LmdlbmVyYXRlUm91dGVTdHJpbmcoKX0jeycvJyBpZiBAcm91dGV9XG4gICAgICBcImlmIEBwYXJlbnQ/LmdlbmVyYXRlUm91dGVTdHJpbmcoKS5sZW5ndGhdfSN7W0Byb3V0ZV19XCJcblxuICAgIGdlbmVyYXRlTmFtZTogLT5cbiAgICAgIFwiI3tbQHBhcmVudC5nZW5lcmF0ZU5hbWUoKSArICcuJyBpZiBAcGFyZW50Py5zdGF0ZW5hbWVdfSN7QHN0YXRlbmFtZX1cIlxuXG4gICAgZ2V0UGFyZW50Q2hhaW46IC0+XG4gICAgICBjaGFpbiA9IEBwYXJlbnQ/LmdldFBhcmVudENoYWluKCkgb3IgW11cbiAgICAgIGNoYWluLnB1c2ggQFxuICAgICAgcmV0dXJuIGNoYWluXG4iXX0=
define('StateManager', ['backbone'], function(Backbone) {
  var StateManager;
  return new (StateManager = (function() {
    var activeState, states;

    states = {};

    activeState = null;

    StateManager.prototype.router = new Backbone.Router();

    StateManager.prototype.go = function(name, parameters, options) {
      var result, state;
      if (parameters == null) {
        parameters = {};
      }
      if (options == null) {
        options = {
          navigate: true
        };
      }
      if (!states[name]) {
        throw new Error('No State with name "' + name + "' found.");
      }
      state = states[name];
      result = state.activate(parameters);
      activeState = state;
      if (options.navigate && !state.abstract && state.route) {
        this.router.navigate(state.generateRoute(parameters));
      }
      return result;
    };

    StateManager.prototype.registerState = function(state) {
      var name;
      name = state.generateName();
      if (states[state.generateName()]) {
        throw new Error('State with name "' + name + '" already exists.');
      }
      states[state.generateName()] = state;
      if ((state.route || state.route === '') && !state.abstract) {
        return this.router.route(state.generateRouteString(), state.generateName(), function() {
          var index, matches, parameters, _arguments, _i, _len;
          _arguments = arguments;
          parameters = {};
          matches = state.generateRouteString().match(/:([a-zA-Z0-9\-_]+)/g);
          if (matches) {
            for (index = _i = 0, _len = matches.length; _i < _len; index = ++_i) {
              name = matches[index];
              parameters[name.substring(1)] = _arguments[index];
            }
          }
          return state.activate(parameters);
        });
      }
    };

    StateManager.prototype.getState = function(name) {
      return states[name];
    };

    StateManager.prototype.clear = function() {
      if (activeState != null) {
        activeState.getParentChain()[0].deactivate();
      }
      return states = {};
    };

    function StateManager() {
      this.clear();
    }

    return StateManager;

  })());
});

//# sourceMappingURL=data:application/json;base64,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QUFBO2FBQ1IsTUFBTyxDQUFBLElBQUEsRUFEQztJQUFBLENBN0JWLENBQUE7O0FBQUEsMkJBZ0NBLEtBQUEsR0FBTyxTQUFBLEdBQUE7O1FBQ0wsV0FBVyxDQUFFLGNBQWIsQ0FBQSxDQUE4QixDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQWpDLENBQUE7T0FBQTthQUNBLE1BQUEsR0FBUyxHQUZKO0lBQUEsQ0FoQ1AsQ0FBQTs7QUFvQ2EsSUFBQSxzQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FEVztJQUFBLENBcENiOzt3QkFBQTs7UUFGaUM7QUFBQSxDQUFyQyxDQUFBLENBQUEiLCJmaWxlIjoiU3RhdGVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lICdTdGF0ZU1hbmFnZXInLCBbJ2JhY2tib25lJ10sIChCYWNrYm9uZSktPlxuICBuZXcgY2xhc3MgU3RhdGVNYW5hZ2VyXG4gICAgc3RhdGVzID0ge31cbiAgICBhY3RpdmVTdGF0ZSA9IG51bGxcbiAgICByb3V0ZXI6IG5ldyBCYWNrYm9uZS5Sb3V0ZXIoKVxuICAgIGdvOiAobmFtZSwgcGFyYW1ldGVycz17fSwgb3B0aW9ucyA9IHtuYXZpZ2F0ZTogdHJ1ZX0pIC0+XG4gICAgICB1bmxlc3Mgc3RhdGVzW25hbWVdXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnTm8gU3RhdGUgd2l0aCBuYW1lIFwiJyArIG5hbWUgKyBcIicgZm91bmQuXCJcbiAgICAgIHN0YXRlID0gc3RhdGVzW25hbWVdXG4gICAgICByZXN1bHQgPSBzdGF0ZS5hY3RpdmF0ZSBwYXJhbWV0ZXJzXG4gICAgICBhY3RpdmVTdGF0ZSA9IHN0YXRlXG4gICAgICBpZiBvcHRpb25zLm5hdmlnYXRlICYmICFzdGF0ZS5hYnN0cmFjdCAmJiBzdGF0ZS5yb3V0ZVxuICAgICAgICBAcm91dGVyLm5hdmlnYXRlIHN0YXRlLmdlbmVyYXRlUm91dGUgcGFyYW1ldGVyc1xuICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgcmVnaXN0ZXJTdGF0ZTogKHN0YXRlKSAtPlxuICAgICAgbmFtZSA9IHN0YXRlLmdlbmVyYXRlTmFtZSgpXG4gICAgICBpZiBzdGF0ZXNbc3RhdGUuZ2VuZXJhdGVOYW1lKCldXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU3RhdGUgd2l0aCBuYW1lIFwiJyArIG5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMuJylcbiAgICAgIHN0YXRlc1tzdGF0ZS5nZW5lcmF0ZU5hbWUoKV0gPSBzdGF0ZVxuICAgICAgaWYgKHN0YXRlLnJvdXRlIG9yIHN0YXRlLnJvdXRlPT0nJykgJiYgIXN0YXRlLmFic3RyYWN0XG4gICAgICAgIEByb3V0ZXIucm91dGUgc3RhdGUuZ2VuZXJhdGVSb3V0ZVN0cmluZygpLCBzdGF0ZS5nZW5lcmF0ZU5hbWUoKSxcbiAgICAgICAgICAtPlxuICAgICAgICAgICAgX2FyZ3VtZW50cyA9IGFyZ3VtZW50c1xuICAgICAgICAgICAgcGFyYW1ldGVycyA9IHt9XG4gICAgICAgICAgICBtYXRjaGVzID0gc3RhdGUuZ2VuZXJhdGVSb3V0ZVN0cmluZygpLm1hdGNoKC86KFthLXpBLVowLTlcXC1fXSspL2cpXG4gICAgICAgICAgICBpZiBtYXRjaGVzXG4gICAgICAgICAgICAgIGZvciBuYW1lLCBpbmRleCBpbiBtYXRjaGVzXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc1tuYW1lLnN1YnN0cmluZygxKV0gPSBfYXJndW1lbnRzW2luZGV4XVxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLmFjdGl2YXRlIHBhcmFtZXRlcnNcblxuICAgIGdldFN0YXRlOiAobmFtZSktPlxuICAgICAgc3RhdGVzW25hbWVdXG5cbiAgICBjbGVhcjogKCktPlxuICAgICAgYWN0aXZlU3RhdGU/LmdldFBhcmVudENoYWluKClbMF0uZGVhY3RpdmF0ZSgpXG4gICAgICBzdGF0ZXMgPSB7fVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBAY2xlYXIoKSJdfQ==