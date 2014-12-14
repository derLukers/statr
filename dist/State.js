(function(root, factory) {
  var StateManager, exports;
  if (typeof define === 'function' && define.amd) {
    define('State', ['StateManager'], function(StateManager) {
      return root.State = factory(StateManager);
    });
  } else if (typeof exports !== 'undefined') {
    StateManager = require('StateManager');
    exports.State = factory(StateManager);
    if (typeof module !== 'undefined' && module.exports) {
      return exports = module.exports = factory(StateManager);
    }
  } else {
    return root.State = factory(StateManager);
  }
})(this, function(StateManager) {
  'use strict';
  var State, insertParameters;
  insertParameters = function(string, parameters) {
    var parameter, result, value;
    result = string;
    for (parameter in parameters) {
      value = parameters[parameter];
      result = result.replace(":" + parameter, value);
    }
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
      resultPromise = $.Deferred();
      if (!this.resolve) {
        resultPromise.resolve(parentResolveResults);
        return resultPromise;
      } else {
        subPromiseList = [];
        _ref = this.resolve;
        for (name in _ref) {
          resolveFunction = _ref[name];
          deferred = resolveFunction(parameters, parentResolveResults);
          deferred.name = name;
          subPromiseList.push(deferred);
        }
        ($.when.apply($, subPromiseList)).then(function() {
          var index, subPromise;
          for (index in subPromiseList) {
            subPromise = subPromiseList[index];
            parentResolveResults[subPromise.name] = arguments[index];
          }
          return resultPromise.resolve(parentResolveResults);
        });
      }
      return resultPromise;
    };

    State.prototype.activate = function(parameters, child, activationPromise) {
      var initial, resolvePromise, _ref;
      if (child == null) {
        child = null;
      }
      if (activationPromise == null) {
        activationPromise = $.Deferred();
      }
      initial = child === null;
      resolvePromise = $.Deferred();
      if (initial) {
        resolvePromise.then(function(resolveResult) {
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
      activationPromise.then((function(_this) {
        return function(resolveResult) {
          _this.currentChild = child;
          _this.isActive = true;
          return typeof _this.onActivate === "function" ? _this.onActivate(parameters, resolveResult) : void 0;
        };
      })(this));
      this.currentParameters = parameters;
      return resolvePromise;
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

//# sourceMappingURL=data:application/json;base64,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QUFBLENBMUVkLENBQUE7O0FBQUEsb0JBNkVBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxXQUFBO0FBQUEsTUFBQSxLQUFBLHVDQUFlLENBQUUsY0FBVCxDQUFBLFdBQUEsSUFBNkIsRUFBckMsQ0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBREEsQ0FBQTtBQUVBLGFBQU8sS0FBUCxDQUhjO0lBQUEsQ0E3RWhCLENBQUE7O2lCQUFBOztPQVpDO0FBQUEsQ0FaTCxDQUFBLENBQUEiLCJmaWxlIjoiU3RhdGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoKHJvb3QsIGZhY3RvcnkpIC0+XG4gIGlmIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyBhbmQgZGVmaW5lLmFtZFxuICAgIGRlZmluZSAnU3RhdGUnLCBbJ1N0YXRlTWFuYWdlciddLCAoU3RhdGVNYW5hZ2VyKSAtPlxuICAgICAgcm9vdC5TdGF0ZSA9IChmYWN0b3J5IFN0YXRlTWFuYWdlcilcbiAgICByZXR1cm5cbiAgZWxzZSBpZiB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJ1xuICAgIFN0YXRlTWFuYWdlciA9IHJlcXVpcmUgJ1N0YXRlTWFuYWdlcidcbiAgICBleHBvcnRzLlN0YXRlID0gKGZhY3RvcnkgU3RhdGVNYW5hZ2VyKVxuICAgIGlmIHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgYW5kIG1vZHVsZS5leHBvcnRzXG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSAoZmFjdG9yeSBTdGF0ZU1hbmFnZXIpXG4gIGVsc2VcbiAgICByb290LlN0YXRlID0gKGZhY3RvcnkgU3RhdGVNYW5hZ2VyKVxuKSBALCAoU3RhdGVNYW5hZ2VyKSAtPlxuICAndXNlIHN0cmljdCdcblxuICBpbnNlcnRQYXJhbWV0ZXJzID0gKHN0cmluZywgcGFyYW1ldGVycyktPlxuICAgIHJlc3VsdCA9IHN0cmluZ1xuXG4gICAgZm9yIHBhcmFtZXRlciwgdmFsdWUgb2YgcGFyYW1ldGVyc1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UgXCI6I3twYXJhbWV0ZXJ9XCIsIHZhbHVlXG5cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgY2xhc3MgU3RhdGVcbiAgICBpc0FjdGl2ZTogZmFsc2VcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgU3RhdGVNYW5hZ2VyLnJlZ2lzdGVyU3RhdGUgQFxuXG4gICAgaW5zZXJ0UGFyYW1ldGVyczogaW5zZXJ0UGFyYW1ldGVyc1xuXG4gICAgZG9SZXNvbHZlOiAocGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdHM9e30pIC0+XG4gICAgICByZXN1bHRQcm9taXNlID0gJC5EZWZlcnJlZCgpXG4gICAgICB1bmxlc3MgQHJlc29sdmVcbiAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgIHJldHVybiByZXN1bHRQcm9taXNlXG4gICAgICBlbHNlXG4gICAgICAgIHN1YlByb21pc2VMaXN0ID0gW11cbiAgICAgICAgZm9yIG5hbWUsIHJlc29sdmVGdW5jdGlvbiBvZiBAcmVzb2x2ZVxuICAgICAgICAgIGRlZmVycmVkID0gcmVzb2x2ZUZ1bmN0aW9uIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgICAgZGVmZXJyZWQubmFtZSA9IG5hbWVcbiAgICAgICAgICBzdWJQcm9taXNlTGlzdC5wdXNoIGRlZmVycmVkXG4gICAgICAgICgkLndoZW4uYXBwbHkgJCwgc3ViUHJvbWlzZUxpc3QpLnRoZW4gLT5cbiAgICAgICAgICBmb3IgaW5kZXgsIHN1YlByb21pc2Ugb2Ygc3ViUHJvbWlzZUxpc3RcbiAgICAgICAgICAgIHBhcmVudFJlc29sdmVSZXN1bHRzW3N1YlByb21pc2UubmFtZV0gPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZVxuXG4gICAgYWN0aXZhdGU6IChwYXJhbWV0ZXJzLCBjaGlsZD1udWxsLCBhY3RpdmF0aW9uUHJvbWlzZT0kLkRlZmVycmVkKCkpIC0+XG4gICAgICBpbml0aWFsID0gY2hpbGQgPT0gbnVsbFxuICAgICAgcmVzb2x2ZVByb21pc2UgPSAkLkRlZmVycmVkKClcblxuICAgICAgaWYgaW5pdGlhbFxuICAgICAgICByZXNvbHZlUHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KSAtPlxuICAgICAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuXG4gICAgICB1bmxlc3MgQGN1cnJlbnRDaGlsZCA9PSBjaGlsZFxuICAgICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgICAgQGN1cnJlbnRDaGlsZCA9IGNoaWxkXG5cbiAgICAgIHVubGVzcyBAaXNBY3RpdmUgYW5kIEBnZW5lcmF0ZVJvdXRlKEBjdXJyZW50UGFyYW1ldGVycykgPT0gQGdlbmVyYXRlUm91dGUocGFyYW1ldGVycylcbiAgICAgICAgaWYgQHBhcmVudFxuICAgICAgICAgIEBwYXJlbnQuYWN0aXZhdGUgcGFyYW1ldGVycywgQCwgYWN0aXZhdGlvblByb21pc2VcbiAgICAgICAgICAudGhlbiAocGFyZW50UmVzb2x2ZVJlc3VsdCkgPT5cbiAgICAgICAgICAgIEBkb1Jlc29sdmUgcGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSByZXNvbHZlUmVzdWx0XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRvUmVzb2x2ZSBwYXJhbWV0ZXJzXG4gICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgICAgICBAcHJldmlvdXNSZXNvbHZlUmVzdWx0ID0gcmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG5cbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSBAcHJldmlvdXNSZXNvbHZlUmVzdWx0XG5cbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpID0+XG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuICAgICAgICBAaXNBY3RpdmUgPSB0cnVlXG4gICAgICAgIEBvbkFjdGl2YXRlPyBwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0XG5cbiAgICAgIEBjdXJyZW50UGFyYW1ldGVycyA9IHBhcmFtZXRlcnNcbiAgICAgIHJldHVybiByZXNvbHZlUHJvbWlzZVxuXG4gICAgZGVhY3RpdmF0ZTogLT5cbiAgICAgIEBpc0FjdGl2ZSA9IGZhbHNlXG4gICAgICBAb25EZWFjdGl2YXRlPygpXG4gICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgIEBjdXJyZW50Q2hpbGQgPSBudWxsXG5cbiAgICBnZW5lcmF0ZVJvdXRlOiAocGFyYW1ldGVycykgLT5cbiAgICAgIFwiI3tbQHBhcmVudC5nZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpICsgJy8nIGlmIEBwYXJlbnQ/LmdlbmVyYXRlUm91dGUocGFyYW1ldGVycykubGVuZ3RoXX1cIiArXG4gICAgICBcIiN7W2luc2VydFBhcmFtZXRlcnMoQHJvdXRlLCBwYXJhbWV0ZXJzKSBpZiBAcm91dGVdfVwiXG5cbiAgICBnZW5lcmF0ZVJvdXRlU3RyaW5nOiAtPlxuICAgICAgXCIje1tcIiN7QHBhcmVudC5nZW5lcmF0ZVJvdXRlU3RyaW5nKCl9I3snLycgaWYgQHJvdXRlfVwiIGlmIEBwYXJlbnQ/LmdlbmVyYXRlUm91dGVTdHJpbmcoKS5sZW5ndGhdfSN7W0Byb3V0ZV19XCJcblxuICAgIGdlbmVyYXRlTmFtZTogLT5cbiAgICAgIFwiI3tbQHBhcmVudC5nZW5lcmF0ZU5hbWUoKSArICcuJyBpZiBAcGFyZW50Py5zdGF0ZW5hbWVdfSN7QHN0YXRlbmFtZX1cIlxuXG4gICAgZ2V0UGFyZW50Q2hhaW46IC0+XG4gICAgICBjaGFpbiA9IEBwYXJlbnQ/LmdldFBhcmVudENoYWluKCkgb3IgW11cbiAgICAgIGNoYWluLnB1c2ggQFxuICAgICAgcmV0dXJuIGNoYWluXG4iXX0=