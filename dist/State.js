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
      var _ref;
      return (((_ref = this.parent) != null ? _ref.generateRoute(parameters).length : void 0) ? this.parent.generateRoute(parameters) + '/' : '') + (this.route ? _.template(this.route)(parameters) : '');
    };

    State.prototype.generateRouteString = function() {
      var _ref;
      return (((_ref = this.parent) != null ? _ref.generateRouteString().length : void 0) ? this.parent.generateRouteString() + (this.route ? '/' : '') : '') + (this.route ? this.route : '');
    };

    State.prototype.generateName = function() {
      var _ref;
      return (((_ref = this.parent) != null ? _ref.statename : void 0) ? this.parent.generateName() + '.' : '') + this.statename;
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

//# sourceMappingURL=data:application/json;base64,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aUVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLElBQUE7YUFBQSxxQ0FBVyxDQUFFLG1CQUFaLEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsR0FBeUIsR0FBcEQsR0FBNkQsRUFBOUQsQ0FBQSxHQUFvRSxJQUFDLENBQUEsVUFEekQ7SUFBQSxDQWpFZCxDQUFBOztBQUFBLG9CQW9FQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsV0FBQTtBQUFBLE1BQUEsS0FBQSx1Q0FBZSxDQUFFLGNBQVQsQ0FBQSxXQUFBLElBQTZCLEVBQXJDLENBQUE7QUFBQSxNQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQURBLENBQUE7QUFFQSxhQUFPLEtBQVAsQ0FIYztJQUFBLENBcEVoQixDQUFBOztpQkFBQTs7T0FORDtBQUFBLENBSkgsQ0FBQSxDQUFBIiwiZmlsZSI6IlN0YXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lIFtcbiAgJy4vU3RhdGVNYW5hZ2VyJ1xuICAncmVxdWlyZSdcbiAgJ3VuZGVyc2NvcmUnXG5dLCAoU3RhdGVNYW5hZ2VyLCByZXF1aXJlLCBfKSAtPlxuICAndXNlIHN0cmljdCdcbiAgXy50ZW1wbGF0ZVNldHRpbmdzID1cbiAgICBpbnRlcnBvbGF0ZTogLzooW2EtekEtWjAtOV9dKykvZ1xuXG4gIGNsYXNzIFN0YXRlXG4gICAgaXNBY3RpdmU6IGZhbHNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKCktPlxuICAgICAgU3RhdGVNYW5hZ2VyLnJlZ2lzdGVyU3RhdGUgQFxuXG4gICAgZG9SZXNvbHZlOiAocGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdHMgPSB7fSktPlxuICAgICAgcmVzdWx0UHJvbWlzZSA9ICQuRGVmZXJyZWQoKVxuICAgICAgdW5sZXNzIEByZXNvbHZlXG4gICAgICAgIHJlc3VsdFByb21pc2UucmVzb2x2ZSBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZVxuICAgICAgZWxzZVxuICAgICAgICBzdWJQcm9taXNlTGlzdCA9IFtdXG4gICAgICAgIGZvciBuYW1lLCByZXNvbHZlRnVuY3Rpb24gb2YgQHJlc29sdmVcbiAgICAgICAgICBkZWZlcnJlZCA9IHJlc29sdmVGdW5jdGlvbi5hcHBseSBALCBwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICAgIGRlZmVycmVkLm5hbWUgPSBuYW1lXG4gICAgICAgICAgc3ViUHJvbWlzZUxpc3QucHVzaCBkZWZlcnJlZFxuICAgICAgICAoJC53aGVuLmFwcGx5ICQsIHN1YlByb21pc2VMaXN0KS50aGVuICgpLT5cbiAgICAgICAgICBmb3IgaW5kZXgsIHN1YlByb21pc2Ugb2Ygc3ViUHJvbWlzZUxpc3RcbiAgICAgICAgICAgIHBhcmVudFJlc29sdmVSZXN1bHRzW3N1YlByb21pc2UubmFtZV0gPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICByZXN1bHRQcm9taXNlXG5cbiAgICBhY3RpdmF0ZTogKHBhcmFtZXRlcnMsIGNoaWxkID0gbnVsbCwgYWN0aXZhdGlvblByb21pc2UgPSAkLkRlZmVycmVkKCkpLT5cbiAgICAgIGluaXRpYWwgPSBjaGlsZCA9PSBudWxsXG4gICAgICByZXNvbHZlUHJvbWlzZSA9ICQuRGVmZXJyZWQoKVxuICAgICAgaWYgaW5pdGlhbFxuICAgICAgICByZXNvbHZlUHJvbWlzZS50aGVuIChyZXNvbHZlUmVzdWx0KS0+XG4gICAgICAgICAgYWN0aXZhdGlvblByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG4gICAgICB1bmxlc3MgQGN1cnJlbnRDaGlsZCA9PSBjaGlsZFxuICAgICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgICAgQGN1cnJlbnRDaGlsZCA9IGNoaWxkXG4gICAgICB1bmxlc3MgQGlzQWN0aXZlIGFuZCBAZ2VuZXJhdGVSb3V0ZShAY3VycmVudFBhcmFtZXRlcnMpID09IEBnZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpXG4gICAgICAgIGlmIEBwYXJlbnRcbiAgICAgICAgICBAcGFyZW50LmFjdGl2YXRlIHBhcmFtZXRlcnMsIEAsIGFjdGl2YXRpb25Qcm9taXNlXG4gICAgICAgICAgLnRoZW4gKHBhcmVudFJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgICAgIEBkb1Jlc29sdmUgcGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZG9SZXNvbHZlIHBhcmFtZXRlcnNcbiAgICAgICAgICAudGhlbiAocmVzb2x2ZVJlc3VsdCk9PlxuICAgICAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcbiAgICAgICAgQGlzQWN0aXZlID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIEBwcmV2aW91c1Jlc29sdmVSZXN1bHRcbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgQG9uQWN0aXZhdGU/IHBhcmFtZXRlcnMsIHJlc29sdmVSZXN1bHRcbiAgICAgIEBjdXJyZW50UGFyYW1ldGVycyA9IHBhcmFtZXRlcnNcbiAgICAgIHJldHVybiByZXNvbHZlUHJvbWlzZVxuXG4gICAgZGVhY3RpdmF0ZTogKCktPlxuICAgICAgQGlzQWN0aXZlID0gZmFsc2VcbiAgICAgIEBvbkRlYWN0aXZhdGU/KClcbiAgICAgIEBjdXJyZW50Q2hpbGQ/LmRlYWN0aXZhdGUoKVxuICAgICAgQGN1cnJlbnRDaGlsZCA9IG51bGxcblxuICAgIGdlbmVyYXRlUm91dGU6IChwYXJhbWV0ZXJzKS0+XG4gICAgICAoaWYgQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKS5sZW5ndGggdGhlbiBAcGFyZW50LmdlbmVyYXRlUm91dGUocGFyYW1ldGVycykrJy8nIGVsc2UgJycpICsgaWYgQHJvdXRlIHRoZW4gXy50ZW1wbGF0ZShAcm91dGUpKHBhcmFtZXRlcnMpIGVsc2UgJydcblxuICAgIGdlbmVyYXRlUm91dGVTdHJpbmc6ICgpLT5cbiAgICAgIChpZiBAcGFyZW50Py5nZW5lcmF0ZVJvdXRlU3RyaW5nKCkubGVuZ3RoIHRoZW4gQHBhcmVudC5nZW5lcmF0ZVJvdXRlU3RyaW5nKCkgKyAoaWYgQHJvdXRlIHRoZW4gJy8nIGVsc2UgJycpIGVsc2UgJycpICsgaWYgQHJvdXRlIHRoZW4gQHJvdXRlIGVsc2UgJydcblxuICAgIGdlbmVyYXRlTmFtZTogKCktPlxuICAgICAgKGlmIEBwYXJlbnQ/LnN0YXRlbmFtZSB0aGVuIEBwYXJlbnQuZ2VuZXJhdGVOYW1lKCkgKyAnLicgZWxzZSAnJykgKyBAc3RhdGVuYW1lXG5cbiAgICBnZXRQYXJlbnRDaGFpbjogLT5cbiAgICAgIGNoYWluID0gQHBhcmVudD8uZ2V0UGFyZW50Q2hhaW4oKSBvciBbXVxuICAgICAgY2hhaW4ucHVzaCBAXG4gICAgICByZXR1cm4gY2hhaW5cbiJdfQ==