
/*
   * State

  The [Angular ui.router Team describes](https://github.com/angular-ui/ui-router/wiki) states as:
  > ... a "place" in the application in terms of the overall UI and navigation.
  This place is both
 */
define(['./StateManager', 'require', 'underscore'], function(StateManager, require, _) {
  'use strict';
  var State;
  _.templateSettings = {
    interpolate: /:([a-zA-Z0-9_]+)/g
  };
  return State = (function() {
    State.prototype.isActive = false;

    function State() {
      StateManager.registerState(this);
    }

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
          deferred = resolveFunction.apply(this, parameters, parentResolveResults);
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
        this.currentChild = child;
        this.isActive = true;
      } else {
        resolvePromise.resolve(this.previousResolveResult);
      }
      activationPromise.then((function(_this) {
        return function(resolveResult) {
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
      return (this.parent ? this.parent.generateRoute(parameters) + '/' : '/') + (this.route ? _.template(this.route)(parameters) : void 0);
    };

    State.prototype.generateRouteString = function() {
      return (this.parent && this.parent.generateRouteString() ? this.parent.generateRouteString() + '/' : '/') + (this.route ? this.route : '');
    };

    State.prototype.generateName = function() {
      return (this.parent && this.parent.statename ? this.parent.generateName() + '.' : '') + this.statename;
    };

    State.prototype.getParentChain = function() {
      var chain;
      if (!this.parent) {
        return [this];
      }
      chain = this.parent.getParentChain();
      chain.push(this);
      return chain;
    };

    return State;

  })();
});

//# sourceMappingURL=data:application/json;base64,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Q0FBQSxNQUFNLENBQUMsU0FBdkIsR0FBc0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUEsQ0FBQSxHQUF5QixHQUEvRCxHQUF3RSxFQUF6RSxDQUFBLEdBQStFLElBQUMsQ0FBQSxVQURwRTtJQUFBLENBakVkLENBQUE7O0FBQUEsb0JBb0VBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxLQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLE1BQVI7QUFDRSxlQUFPLENBQUMsSUFBRCxDQUFQLENBREY7T0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBRlIsQ0FBQTtBQUFBLE1BR0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBSEEsQ0FBQTtBQUlBLGFBQU8sS0FBUCxDQUxjO0lBQUEsQ0FwRWhCLENBQUE7O2lCQUFBOztPQU5EO0FBQUEsQ0FKSCxDQVJBLENBQUEiLCJmaWxlIjoiU3RhdGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAgIyBTdGF0ZVxuXG4gIFRoZSBbQW5ndWxhciB1aS5yb3V0ZXIgVGVhbSBkZXNjcmliZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlci93aWtpKSBzdGF0ZXMgYXM6XG4gID4gLi4uIGEgXCJwbGFjZVwiIGluIHRoZSBhcHBsaWNhdGlvbiBpbiB0ZXJtcyBvZiB0aGUgb3ZlcmFsbCBVSSBhbmQgbmF2aWdhdGlvbi5cbiAgVGhpcyBwbGFjZSBpcyBib3RoXG5cbiMjI1xuZGVmaW5lIFtcbiAgJy4vU3RhdGVNYW5hZ2VyJ1xuICAncmVxdWlyZSdcbiAgJ3VuZGVyc2NvcmUnXG5dLCAoU3RhdGVNYW5hZ2VyLCByZXF1aXJlLCBfKSAtPlxuICAndXNlIHN0cmljdCdcbiAgXy50ZW1wbGF0ZVNldHRpbmdzID1cbiAgICBpbnRlcnBvbGF0ZTogLzooW2EtekEtWjAtOV9dKykvZ1xuXG4gIGNsYXNzIFN0YXRlXG4gICAgaXNBY3RpdmU6IGZhbHNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKCktPlxuICAgICAgU3RhdGVNYW5hZ2VyLnJlZ2lzdGVyU3RhdGUgQFxuXG4gICAgZG9SZXNvbHZlOiAocGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdHMgPSB7fSktPlxuICAgICAgcmVzdWx0UHJvbWlzZSA9ICQuRGVmZXJyZWQoKVxuICAgICAgdW5sZXNzIEByZXNvbHZlXG4gICAgICAgIHJlc3VsdFByb21pc2UucmVzb2x2ZSBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZVxuICAgICAgZWxzZVxuICAgICAgICBzdWJQcm9taXNlTGlzdCA9IFtdXG4gICAgICAgIGZvciBuYW1lLCByZXNvbHZlRnVuY3Rpb24gb2YgQHJlc29sdmVcbiAgICAgICAgICBkZWZlcnJlZCA9IHJlc29sdmVGdW5jdGlvbi5hcHBseSBALCBwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICAgIGRlZmVycmVkLm5hbWUgPSBuYW1lXG4gICAgICAgICAgc3ViUHJvbWlzZUxpc3QucHVzaCBkZWZlcnJlZFxuICAgICAgICAoJC53aGVuLmFwcGx5ICQsIHN1YlByb21pc2VMaXN0KS50aGVuICgpLT5cbiAgICAgICAgICBmb3IgaW5kZXgsIHN1YlByb21pc2Ugb2Ygc3ViUHJvbWlzZUxpc3RcbiAgICAgICAgICAgIHBhcmVudFJlc29sdmVSZXN1bHRzW3N1YlByb21pc2UubmFtZV0gPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICByZXN1bHRQcm9taXNlXG5cbiAgICBhY3RpdmF0ZTogKHBhcmFtZXRlcnMsIGNoaWxkID0gbnVsbCwgYWN0aXZhdGlvblByb21pc2UgPSAkLkRlZmVycmVkKCkpLT5cbiAgICAgIGluaXRpYWwgPSBjaGlsZCA9PSBudWxsXG4gICAgICByZXNvbHZlUHJvbWlzZSA9ICQuRGVmZXJyZWQoKVxuICAgICAgaWYgaW5pdGlhbFxuICAgICAgICByZXNvbHZlUHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KS0+XG4gICAgICAgICAgYWN0aXZhdGlvblByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG4gICAgICB1bmxlc3MgQGN1cnJlbnRDaGlsZCA9PSBjaGlsZCAjZm9vXG4gICAgICAgIEBjdXJyZW50Q2hpbGQ/LmRlYWN0aXZhdGUoKVxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcbiAgICAgIHVubGVzcyBAaXNBY3RpdmUgJiYgQGdlbmVyYXRlUm91dGUoQGN1cnJlbnRQYXJhbWV0ZXJzKSA9PSBAZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKVxuICAgICAgICBpZiBAcGFyZW50XG4gICAgICAgICAgQHBhcmVudC5hY3RpdmF0ZSBwYXJhbWV0ZXJzLCBALCBhY3RpdmF0aW9uUHJvbWlzZVxuICAgICAgICAgIC50aGVuIChwYXJlbnRSZXNvbHZlUmVzdWx0KT0+XG4gICAgICAgICAgICBAZG9SZXNvbHZlIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgIC50aGVuIChyZXNvbHZlUmVzdWx0KT0+XG4gICAgICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSByZXNvbHZlUmVzdWx0XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRvUmVzb2x2ZSBwYXJhbWV0ZXJzXG4gICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSByZXNvbHZlUmVzdWx0XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIHJlc29sdmVSZXN1bHRcbiAgICAgICAgQGN1cnJlbnRDaGlsZCA9IGNoaWxkXG4gICAgICAgIEBpc0FjdGl2ZSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSBAcHJldmlvdXNSZXNvbHZlUmVzdWx0XG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KT0+XG4gICAgICAgIEBvbkFjdGl2YXRlPyBwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0XG4gICAgICBAY3VycmVudFBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzXG4gICAgICByZXR1cm4gcmVzb2x2ZVByb21pc2VcblxuICAgIGRlYWN0aXZhdGU6ICgpLT5cbiAgICAgIEBpc0FjdGl2ZSA9IGZhbHNlXG4gICAgICBAb25EZWFjdGl2YXRlPygpXG4gICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgIEBjdXJyZW50Q2hpbGQgPSBudWxsXG5cbiAgICBnZW5lcmF0ZVJvdXRlOiAocGFyYW1ldGVycyktPlxuICAgICAgKGlmIEBwYXJlbnQgdGhlbiBAcGFyZW50LmdlbmVyYXRlUm91dGUocGFyYW1ldGVycykgKyAnLycgZWxzZSAnLycpICsgaWYgQHJvdXRlIHRoZW4gXy50ZW1wbGF0ZShAcm91dGUpKHBhcmFtZXRlcnMpXG5cbiAgICBnZW5lcmF0ZVJvdXRlU3RyaW5nOiAoKS0+XG4gICAgICAoaWYgQHBhcmVudCAmJiBAcGFyZW50LmdlbmVyYXRlUm91dGVTdHJpbmcoKSB0aGVuIEBwYXJlbnQuZ2VuZXJhdGVSb3V0ZVN0cmluZygpICsgJy8nIGVsc2UgJy8nKSArIGlmIEByb3V0ZSB0aGVuIEByb3V0ZSBlbHNlICcnXG5cbiAgICBnZW5lcmF0ZU5hbWU6ICgpLT5cbiAgICAgIChpZiBAcGFyZW50IGFuZCBAcGFyZW50LnN0YXRlbmFtZSB0aGVuIEBwYXJlbnQuZ2VuZXJhdGVOYW1lKCkgKyAnLicgZWxzZSAnJykgKyBAc3RhdGVuYW1lXG5cbiAgICBnZXRQYXJlbnRDaGFpbjogLT5cbiAgICAgIHVubGVzcyBAcGFyZW50XG4gICAgICAgIHJldHVybiBbQF1cbiAgICAgIGNoYWluID0gQHBhcmVudC5nZXRQYXJlbnRDaGFpbigpXG4gICAgICBjaGFpbi5wdXNoIEBcbiAgICAgIHJldHVybiBjaGFpblxuIl19