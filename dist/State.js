define('State', ['StateManager'], function(StateManager) {
  'use strict';
  var State, defer;
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

    State.prototype.activationHooks = [];

    State.prototype.doResolve = function(parameters, parentResolveResults) {
      var name, ref, resolveFunction, resolveResult, resultPromise, subPromiseList;
      if (parentResolveResults == null) {
        parentResolveResults = {};
      }
      resultPromise = defer();
      if (!this.resolve) {
        resultPromise.resolve(parentResolveResults);
        return resultPromise.promise;
      } else {
        subPromiseList = [];
        ref = this.resolve;
        for (name in ref) {
          resolveFunction = ref[name];
          resolveResult = resolveFunction(parameters, parentResolveResults) || {};
          resolveResult.name = name;
          subPromiseList.push(resolveResult);
        }
        Promise.all(subPromiseList).then((function(_this) {
          return function() {
            var index, subPromise;
            for (index in subPromiseList) {
              subPromise = subPromiseList[index];
              parentResolveResults[subPromise.name] = arguments[index];
            }
            _this.previousResolveResult = parentResolveResults;
            return resultPromise.resolve(parentResolveResults);
          };
        })(this));
      }
      return resultPromise.promise;
    };

    State.prototype.activate = function(parameters, child, resolvePromise) {
      var activationPromise, initial, innerResolvePromise, parentActivateResult, ref;
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
        if ((ref = this.currentChild) != null) {
          ref.deactivate();
        }
        this.currentChild = child;
      }
      if (initial) {
        innerResolvePromise.promise.then(resolvePromise.resolve, resolvePromise.reject);
      }
      innerResolvePromise.promise.then((function(_this) {
        return function(resolveResult) {
          return _this.previousResolveResult = resolveResult;
        };
      })(this));
      activationPromise.promise.then((function(_this) {
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
              return _this.executeActivationHooks(parameters, resolveResults).then(activationPromise.resolve, activationPromise.reject);
            };
          })(this));
        } else {
          this.doResolve(parameters).then(innerResolvePromise.resolve);
          resolvePromise.promise.then((function(_this) {
            return function(resolveResults) {
              return _this.executeActivationHooks(parameters, resolveResults).then(activationPromise.resolve, activationPromise.reject);
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

    State.prototype.paramsUnchanged = function(params, currentParams) {
      var name, value;
      if (currentParams == null) {
        currentParams = this.currentParams || {};
      }
      if (!params) {
        return true;
      }
      return [
        (function() {
          var i, len, results;
          results = [];
          for (value = i = 0, len = currentParams.length; i < len; value = ++i) {
            name = currentParams[value];
            results.push(params[name] === value);
          }
          return results;
        })()
      ].every(function(x) {
        return x === true;
      });
    };

    State.prototype.executeActivationHooks = function(params, resolveResults) {
      var hook, hookpromises;
      hookpromises = [
        (function() {
          var i, len, ref, results;
          ref = this.activationHooks;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            hook = ref[i];
            results.push(hook(params, resolveResults));
          }
          return results;
        }).call(this)
      ];
      return Promise.all(hookpromises);
    };

    State.prototype.deactivate = function() {
      var ref;
      this.isActive = false;
      if ((ref = this.currentChild) != null) {
        ref.deactivate();
      }
      if (typeof this.onDeactivate === "function") {
        this.onDeactivate();
      }
      return this.currentChild = null;
    };

    State.prototype.onActivate = function(cb) {
      return this.activationHooks.push(cb);
    };

    State.prototype.generateName = function() {
      var ref;
      return "" + [((ref = this.parent) != null ? ref.statename : void 0) ? this.parent.generateName() + '.' : void 0] + this.statename;
    };

    State.prototype.getParentChain = function() {
      var chain, ref;
      chain = ((ref = this.parent) != null ? ref.getParentChain() : void 0) || [];
      chain.push(this);
      return chain;
    };

    return State;

  })();
});

//# sourceMappingURL=data:application/json;base64,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LFlBQUQsR0FBZ0IsS0FKTjtJQUFBLENBM0VaLENBQUE7O0FBQUEsb0JBaUZBLFVBQUEsR0FBWSxTQUFDLEVBQUQsR0FBQTthQUNWLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsRUFBdEIsRUFEVTtJQUFBLENBakZaLENBQUE7O0FBQUEsb0JBb0ZBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLEdBQUE7YUFBQSxFQUFBLEdBQUcsbUNBQXdDLENBQUUsbUJBQXpDLEdBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBQSxHQUF5QixHQUF6QixHQUFBLE1BQUQsQ0FBSCxHQUEwRCxJQUFDLENBQUEsVUFEL0M7SUFBQSxDQXBGZCxDQUFBOztBQUFBLG9CQXVGQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsVUFBQTtBQUFBLE1BQUEsS0FBQSxxQ0FBZSxDQUFFLGNBQVQsQ0FBQSxXQUFBLElBQTZCLEVBQXJDLENBQUE7QUFBQSxNQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQURBLENBQUE7QUFFQSxhQUFPLEtBQVAsQ0FIYztJQUFBLENBdkZoQixDQUFBOztpQkFBQTs7T0FYOEI7QUFBQSxDQUFsQyxDQUFBLENBQUEiLCJmaWxlIjoiU3RhdGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUgJ1N0YXRlJywgWydTdGF0ZU1hbmFnZXInXSwgKFN0YXRlTWFuYWdlcikgLT5cbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZGVmZXIgPSAoKS0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpLT5cbiAgICAgIHJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdFxuICAgIHJldHVybiByZXN1bHRcblxuICBjbGFzcyBTdGF0ZVxuICAgIGlzQWN0aXZlOiBmYWxzZVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBTdGF0ZU1hbmFnZXIucmVnaXN0ZXJTdGF0ZSBAXG5cbiAgICBhY3RpdmF0aW9uSG9va3M6IFtdXG5cbiAgICBkb1Jlc29sdmU6IChwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0cz17fSkgLT5cbiAgICAgIHJlc3VsdFByb21pc2UgPSBkZWZlcigpXG4gICAgICB1bmxlc3MgQHJlc29sdmVcbiAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlKHBhcmVudFJlc29sdmVSZXN1bHRzKVxuICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZS5wcm9taXNlXG4gICAgICBlbHNlXG4gICAgICAgIHN1YlByb21pc2VMaXN0ID0gW11cbiAgICAgICAgZm9yIG5hbWUsIHJlc29sdmVGdW5jdGlvbiBvZiBAcmVzb2x2ZVxuICAgICAgICAgIHJlc29sdmVSZXN1bHQgPSByZXNvbHZlRnVuY3Rpb24ocGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdHMpIHx8IHt9XG4gICAgICAgICAgcmVzb2x2ZVJlc3VsdC5uYW1lID0gbmFtZVxuICAgICAgICAgIHN1YlByb21pc2VMaXN0LnB1c2ggcmVzb2x2ZVJlc3VsdFxuICAgICAgICBQcm9taXNlLmFsbChzdWJQcm9taXNlTGlzdCkudGhlbiA9PlxuICAgICAgICAgIGZvciBpbmRleCwgc3ViUHJvbWlzZSBvZiBzdWJQcm9taXNlTGlzdFxuICAgICAgICAgICAgcGFyZW50UmVzb2x2ZVJlc3VsdHNbc3ViUHJvbWlzZS5uYW1lXSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgICBAcHJldmlvdXNSZXNvbHZlUmVzdWx0ID0gcGFyZW50UmVzb2x2ZVJlc3VsdHNcbiAgICAgICAgICByZXN1bHRQcm9taXNlLnJlc29sdmUocGFyZW50UmVzb2x2ZVJlc3VsdHMpXG4gICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZS5wcm9taXNlXG5cbiAgICBhY3RpdmF0ZTogKHBhcmFtZXRlcnMsIGNoaWxkPW51bGwsIHJlc29sdmVQcm9taXNlPWRlZmVyKCkpLT5cbiAgICAgIGluaXRpYWwgPSBjaGlsZCA9PSBudWxsXG4gICAgICBpbm5lclJlc29sdmVQcm9taXNlID0gZGVmZXIoKVxuICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBkZWZlcigpXG5cbiAgICAgIHVubGVzcyBAY3VycmVudENoaWxkID09IGNoaWxkXG4gICAgICAgIEBjdXJyZW50Q2hpbGQ/LmRlYWN0aXZhdGUoKVxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcblxuICAgICAgaWYgaW5pdGlhbFxuICAgICAgICBpbm5lclJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiByZXNvbHZlUHJvbWlzZS5yZXNvbHZlLCByZXNvbHZlUHJvbWlzZS5yZWplY3RcblxuICAgICAgaW5uZXJSZXNvbHZlUHJvbWlzZS5wcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcblxuICAgICAgYWN0aXZhdGlvblByb21pc2UucHJvbWlzZS50aGVuICgpPT5cbiAgICAgICAgQGN1cnJlbnRDaGlsZCA9IGNoaWxkXG4gICAgICAgIEBpc0FjdGl2ZSA9IHRydWVcbiAgICAgICAgQGN1cnJlbnRQYXJhbXMgPSBwYXJhbWV0ZXJzXG5cbiAgICAgIHVubGVzcyBAaXNBY3RpdmUgYW5kIEBwYXJhbXNVbmNoYW5nZWQocGFyYW1ldGVycylcbiAgICAgICAgaWYgQHBhcmVudFxuICAgICAgICAgIHBhcmVudEFjdGl2YXRlUmVzdWx0ID0gQHBhcmVudC5hY3RpdmF0ZShwYXJhbWV0ZXJzLCBALCByZXNvbHZlUHJvbWlzZSlcbiAgICAgICAgICBwYXJlbnRBY3RpdmF0ZVJlc3VsdFswXS50aGVuIChyZXNvbHZlUmVzdWx0cyk9PlxuICAgICAgICAgICAgQGRvUmVzb2x2ZShwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0cykudGhlbiBpbm5lclJlc29sdmVQcm9taXNlLnJlc29sdmUsIGlubmVyUmVzb2x2ZVByb21pc2UucmVqZWN0XG4gICAgICAgICAgcGFyZW50QWN0aXZhdGVSZXN1bHRbMV0udGhlbiAocmVzb2x2ZVJlc3VsdHMpPT5cbiAgICAgICAgICAgIEBleGVjdXRlQWN0aXZhdGlvbkhvb2tzKHBhcmFtZXRlcnMsIHJlc29sdmVSZXN1bHRzKVxuICAgICAgICAgICAgLnRoZW4gYWN0aXZhdGlvblByb21pc2UucmVzb2x2ZSwgYWN0aXZhdGlvblByb21pc2UucmVqZWN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZG9SZXNvbHZlKHBhcmFtZXRlcnMpLnRoZW4gaW5uZXJSZXNvbHZlUHJvbWlzZS5yZXNvbHZlXG4gICAgICAgICAgcmVzb2x2ZVByb21pc2UucHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0cyk9PlxuICAgICAgICAgICAgQGV4ZWN1dGVBY3RpdmF0aW9uSG9va3MocGFyYW1ldGVycywgcmVzb2x2ZVJlc3VsdHMpXG4gICAgICAgICAgICAudGhlbiBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlLCBhY3RpdmF0aW9uUHJvbWlzZS5yZWplY3RcbiAgICAgIGVsc2VcbiAgICAgICAgaW5uZXJSZXNvbHZlUHJvbWlzZS5yZXNvbHZlIEBwcmV2aW91c1Jlc29sdmVSZXN1bHRcbiAgICAgICAgcmVzb2x2ZVByb21pc2UucHJvbWlzZS50aGVuIGFjdGl2YXRpb25Qcm9taXNlLnJlc29sdmUsIGFjdGl2YXRpb25Qcm9taXNlLnJlamVjdFxuXG4gICAgICB1bmxlc3MgaW5pdGlhbFxuICAgICAgICByZXR1cm4gW2lubmVyUmVzb2x2ZVByb21pc2UucHJvbWlzZSwgYWN0aXZhdGlvblByb21pc2UucHJvbWlzZV1cbiAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZS5wcm9taXNlXG5cbiAgICBwYXJhbXNVbmNoYW5nZWQ6IChwYXJhbXMsIGN1cnJlbnRQYXJhbXMgPSBAY3VycmVudFBhcmFtcyB8fCB7fSktPlxuICAgICAgdW5sZXNzIHBhcmFtc1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgcmV0dXJuIFtwYXJhbXNbbmFtZV0gPT0gdmFsdWUgZm9yIG5hbWUsIHZhbHVlIGluIGN1cnJlbnRQYXJhbXNdLmV2ZXJ5ICh4KS0+eD09dHJ1ZVxuXG4gICAgZXhlY3V0ZUFjdGl2YXRpb25Ib29rczogKHBhcmFtcywgcmVzb2x2ZVJlc3VsdHMpIC0+XG4gICAgICBob29rcHJvbWlzZXMgPSBbaG9vayhwYXJhbXMsIHJlc29sdmVSZXN1bHRzKSBmb3IgaG9vayBpbiBAYWN0aXZhdGlvbkhvb2tzXVxuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGhvb2twcm9taXNlcylcblxuICAgIGRlYWN0aXZhdGU6IC0+XG4gICAgICBAaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICBAb25EZWFjdGl2YXRlPygpXG4gICAgICBAY3VycmVudENoaWxkID0gbnVsbFxuXG4gICAgb25BY3RpdmF0ZTogKGNiKS0+XG4gICAgICBAYWN0aXZhdGlvbkhvb2tzLnB1c2goY2IpXG5cbiAgICBnZW5lcmF0ZU5hbWU6IC0+XG4gICAgICBcIiN7W0BwYXJlbnQuZ2VuZXJhdGVOYW1lKCkgKyAnLicgaWYgQHBhcmVudD8uc3RhdGVuYW1lXX0je0BzdGF0ZW5hbWV9XCJcblxuICAgIGdldFBhcmVudENoYWluOiAtPlxuICAgICAgY2hhaW4gPSBAcGFyZW50Py5nZXRQYXJlbnRDaGFpbigpIG9yIFtdXG4gICAgICBjaGFpbi5wdXNoIEBcbiAgICAgIHJldHVybiBjaGFpblxuIl19