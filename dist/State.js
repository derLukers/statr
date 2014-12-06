
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
      var _ref, _ref1;
      return ((_ref = (_ref1 = this.parent) != null ? _ref1.generateRoute(parameters) : void 0) != null ? _ref : '') + (this.route ? '/' + _.template(this.route)(parameters) : void 0);
    };

    State.prototype.generateRouteString = function() {
      var _ref, _ref1;
      return ((_ref = (_ref1 = this.parent) != null ? _ref1.generateRouteString() : void 0) != null ? _ref : '') + (this.route ? '/' + this.route : '');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBOzs7Ozs7R0FBQTtBQUFBLE1BUUEsQ0FBTyxDQUNMLGdCQURLLEVBRUwsU0FGSyxFQUdMLFlBSEssQ0FBUCxFQUlHLFNBQUMsWUFBRCxFQUFlLE9BQWYsRUFBd0IsQ0FBeEIsR0FBQTtBQUNELEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxLQUFBO0FBQUEsRUFDQSxDQUFDLENBQUMsZ0JBQUYsR0FDRTtBQUFBLElBQUEsV0FBQSxFQUFhLG1CQUFiO0dBRkYsQ0FBQTtTQUlNO0FBQ0osb0JBQUEsUUFBQSxHQUFVLEtBQVYsQ0FBQTs7QUFFYSxJQUFBLGVBQUEsR0FBQTtBQUNYLE1BQUEsWUFBWSxDQUFDLGFBQWIsQ0FBMkIsSUFBM0IsQ0FBQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSxvQkFLQSxTQUFBLEdBQVcsU0FBQyxVQUFELEVBQWEsb0JBQWIsR0FBQTtBQUNULFVBQUEsb0VBQUE7O1FBRHNCLHVCQUF1QjtPQUM3QztBQUFBLE1BQUEsYUFBQSxHQUFnQixDQUFDLENBQUMsUUFBRixDQUFBLENBQWhCLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsT0FBUjtBQUNFLFFBQUEsYUFBYSxDQUFDLE9BQWQsQ0FBc0Isb0JBQXRCLENBQUEsQ0FBQTtBQUNBLGVBQU8sYUFBUCxDQUZGO09BQUEsTUFBQTtBQUlFLFFBQUEsY0FBQSxHQUFpQixFQUFqQixDQUFBO0FBQ0E7QUFBQSxhQUFBLFlBQUE7dUNBQUE7QUFDRSxVQUFBLFFBQUEsR0FBVyxlQUFlLENBQUMsS0FBaEIsQ0FBc0IsSUFBdEIsRUFBeUIsVUFBekIsRUFBcUMsb0JBQXJDLENBQVgsQ0FBQTtBQUFBLFVBQ0EsUUFBUSxDQUFDLElBQVQsR0FBZ0IsSUFEaEIsQ0FBQTtBQUFBLFVBRUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FGQSxDQURGO0FBQUEsU0FEQTtBQUFBLFFBS0EsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQVAsQ0FBYSxDQUFiLEVBQWdCLGNBQWhCLENBQUQsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFBLEdBQUE7QUFDcEMsY0FBQSxpQkFBQTtBQUFBLGVBQUEsdUJBQUE7K0NBQUE7QUFDRSxZQUFBLG9CQUFxQixDQUFBLFVBQVUsQ0FBQyxJQUFYLENBQXJCLEdBQXdDLFNBQVUsQ0FBQSxLQUFBLENBQWxELENBREY7QUFBQSxXQUFBO2lCQUVBLGFBQWEsQ0FBQyxPQUFkLENBQXNCLG9CQUF0QixFQUhvQztRQUFBLENBQXRDLENBTEEsQ0FKRjtPQURBO2FBY0EsY0FmUztJQUFBLENBTFgsQ0FBQTs7QUFBQSxvQkFzQkEsUUFBQSxHQUFVLFNBQUMsVUFBRCxFQUFhLEtBQWIsRUFBMkIsaUJBQTNCLEdBQUE7QUFDUixVQUFBLDZCQUFBOztRQURxQixRQUFRO09BQzdCOztRQURtQyxvQkFBb0IsQ0FBQyxDQUFDLFFBQUYsQ0FBQTtPQUN2RDtBQUFBLE1BQUEsT0FBQSxHQUFVLEtBQUEsS0FBUyxJQUFuQixDQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FEakIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxPQUFIO0FBQ0UsUUFBQSxjQUFjLENBQUMsSUFBZixDQUFvQixTQUFDLGFBQUQsR0FBQTtpQkFDbEIsaUJBQWlCLENBQUMsT0FBbEIsQ0FBMEIsYUFBMUIsRUFEa0I7UUFBQSxDQUFwQixDQUFBLENBREY7T0FGQTtBQUtBLE1BQUEsSUFBTyxJQUFDLENBQUEsWUFBRCxLQUFpQixLQUF4Qjs7Y0FDZSxDQUFFLFVBQWYsQ0FBQTtTQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQURoQixDQURGO09BTEE7QUFRQSxNQUFBLElBQUEsQ0FBQSxDQUFPLElBQUMsQ0FBQSxRQUFELElBQWEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFDLENBQUEsaUJBQWhCLENBQUEsS0FBc0MsSUFBQyxDQUFBLGFBQUQsQ0FBZSxVQUFmLENBQTFELENBQUE7QUFDRSxRQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFDRSxVQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixVQUFqQixFQUE2QixJQUE3QixFQUFnQyxpQkFBaEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUMsbUJBQUQsR0FBQTtxQkFDSixLQUFDLENBQUEsU0FBRCxDQUFXLFVBQVgsRUFBdUIsbUJBQXZCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxhQUFELEdBQUE7QUFDSixnQkFBQSxLQUFDLENBQUEscUJBQUQsR0FBeUIsYUFBekIsQ0FBQTt1QkFDQSxjQUFjLENBQUMsT0FBZixDQUF1QixhQUF2QixFQUZJO2NBQUEsQ0FETixFQURJO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUFBLENBREY7U0FBQSxNQUFBO0FBUUUsVUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLFVBQVgsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUMsYUFBRCxHQUFBO0FBQ0osY0FBQSxLQUFDLENBQUEscUJBQUQsR0FBeUIsYUFBekIsQ0FBQTtxQkFDQSxjQUFjLENBQUMsT0FBZixDQUF1QixhQUF2QixFQUZJO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUFBLENBUkY7U0FBQTtBQUFBLFFBWUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsS0FaaEIsQ0FBQTtBQUFBLFFBYUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQWJaLENBREY7T0FBQSxNQUFBO0FBZ0JFLFFBQUEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsSUFBQyxDQUFBLHFCQUF4QixDQUFBLENBaEJGO09BUkE7QUFBQSxNQXlCQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxhQUFELEdBQUE7MERBQ3JCLEtBQUMsQ0FBQSxXQUFZLFlBQVksd0JBREo7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQXpCQSxDQUFBO0FBQUEsTUEyQkEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLFVBM0JyQixDQUFBO0FBNEJBLGFBQU8sY0FBUCxDQTdCUTtJQUFBLENBdEJWLENBQUE7O0FBQUEsb0JBcURBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBWixDQUFBOztRQUNBLElBQUMsQ0FBQTtPQUREOztZQUVhLENBQUUsVUFBZixDQUFBO09BRkE7YUFHQSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQUpOO0lBQUEsQ0FyRFosQ0FBQTs7QUFBQSxvQkEyREEsYUFBQSxHQUFlLFNBQUMsVUFBRCxHQUFBO0FBQ2IsVUFBQSxXQUFBO2FBQUEsb0dBQXNDLEVBQXRDLENBQUEsR0FBNEMsQ0FBRyxJQUFDLENBQUEsS0FBSixHQUFlLEdBQUEsR0FBSSxDQUFDLENBQUMsUUFBRixDQUFXLElBQUMsQ0FBQSxLQUFaLENBQUEsQ0FBbUIsVUFBbkIsQ0FBbkIsR0FBQSxNQUFBLEVBRC9CO0lBQUEsQ0EzRGYsQ0FBQTs7QUFBQSxvQkE4REEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsV0FBQTthQUFBLGdHQUFrQyxFQUFsQyxDQUFBLEdBQXdDLENBQUcsSUFBQyxDQUFBLEtBQUosR0FBZSxHQUFBLEdBQUksSUFBQyxDQUFBLEtBQXBCLEdBQStCLEVBQS9CLEVBRHJCO0lBQUEsQ0E5RHJCLENBQUE7O0FBQUEsb0JBaUVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixDQUFJLElBQUMsQ0FBQSxNQUFELElBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUF2QixHQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQSxDQUFBLEdBQXlCLEdBQS9ELEdBQXdFLEVBQXpFLENBQUEsR0FBK0UsSUFBQyxDQUFBLFVBRHBFO0lBQUEsQ0FqRWQsQ0FBQTs7QUFBQSxvQkFvRUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsTUFBUjtBQUNFLGVBQU8sQ0FBQyxJQUFELENBQVAsQ0FERjtPQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUEsQ0FGUixDQUFBO0FBQUEsTUFHQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FIQSxDQUFBO0FBSUEsYUFBTyxLQUFQLENBTGM7SUFBQSxDQXBFaEIsQ0FBQTs7aUJBQUE7O09BTkQ7QUFBQSxDQUpILENBUkEsQ0FBQSIsImZpbGUiOiJTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICAjIFN0YXRlXG5cbiAgVGhlIFtBbmd1bGFyIHVpLnJvdXRlciBUZWFtIGRlc2NyaWJlc10oaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyL3dpa2kpIHN0YXRlcyBhczpcbiAgPiAuLi4gYSBcInBsYWNlXCIgaW4gdGhlIGFwcGxpY2F0aW9uIGluIHRlcm1zIG9mIHRoZSBvdmVyYWxsIFVJIGFuZCBuYXZpZ2F0aW9uLlxuICBUaGlzIHBsYWNlIGlzIGJvdGhcblxuIyMjXG5kZWZpbmUgW1xuICAnLi9TdGF0ZU1hbmFnZXInXG4gICdyZXF1aXJlJ1xuICAndW5kZXJzY29yZSdcbl0sIChTdGF0ZU1hbmFnZXIsIHJlcXVpcmUsIF8pIC0+XG4gICd1c2Ugc3RyaWN0J1xuICBfLnRlbXBsYXRlU2V0dGluZ3MgPVxuICAgIGludGVycG9sYXRlOiAvOihbYS16QS1aMC05X10rKS9nXG5cbiAgY2xhc3MgU3RhdGVcbiAgICBpc0FjdGl2ZTogZmFsc2VcblxuICAgIGNvbnN0cnVjdG9yOiAoKS0+XG4gICAgICBTdGF0ZU1hbmFnZXIucmVnaXN0ZXJTdGF0ZSBAXG5cbiAgICBkb1Jlc29sdmU6IChwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0cyA9IHt9KS0+XG4gICAgICByZXN1bHRQcm9taXNlID0gJC5EZWZlcnJlZCgpXG4gICAgICB1bmxlc3MgQHJlc29sdmVcbiAgICAgICAgcmVzdWx0UHJvbWlzZS5yZXNvbHZlIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgIHJldHVybiByZXN1bHRQcm9taXNlXG4gICAgICBlbHNlXG4gICAgICAgIHN1YlByb21pc2VMaXN0ID0gW11cbiAgICAgICAgZm9yIG5hbWUsIHJlc29sdmVGdW5jdGlvbiBvZiBAcmVzb2x2ZVxuICAgICAgICAgIGRlZmVycmVkID0gcmVzb2x2ZUZ1bmN0aW9uLmFwcGx5IEAsIHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzXG4gICAgICAgICAgZGVmZXJyZWQubmFtZSA9IG5hbWVcbiAgICAgICAgICBzdWJQcm9taXNlTGlzdC5wdXNoIGRlZmVycmVkXG4gICAgICAgICgkLndoZW4uYXBwbHkgJCwgc3ViUHJvbWlzZUxpc3QpLnRoZW4gKCktPlxuICAgICAgICAgIGZvciBpbmRleCwgc3ViUHJvbWlzZSBvZiBzdWJQcm9taXNlTGlzdFxuICAgICAgICAgICAgcGFyZW50UmVzb2x2ZVJlc3VsdHNbc3ViUHJvbWlzZS5uYW1lXSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgICByZXN1bHRQcm9taXNlLnJlc29sdmUgcGFyZW50UmVzb2x2ZVJlc3VsdHNcbiAgICAgIHJlc3VsdFByb21pc2VcblxuICAgIGFjdGl2YXRlOiAocGFyYW1ldGVycywgY2hpbGQgPSBudWxsLCBhY3RpdmF0aW9uUHJvbWlzZSA9ICQuRGVmZXJyZWQoKSktPlxuICAgICAgaW5pdGlhbCA9IGNoaWxkID09IG51bGxcbiAgICAgIHJlc29sdmVQcm9taXNlID0gJC5EZWZlcnJlZCgpXG4gICAgICBpZiBpbml0aWFsXG4gICAgICAgIHJlc29sdmVQcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpLT5cbiAgICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlIHJlc29sdmVSZXN1bHRcbiAgICAgIHVubGVzcyBAY3VycmVudENoaWxkID09IGNoaWxkICNmb29cbiAgICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuICAgICAgdW5sZXNzIEBpc0FjdGl2ZSAmJiBAZ2VuZXJhdGVSb3V0ZShAY3VycmVudFBhcmFtZXRlcnMpID09IEBnZW5lcmF0ZVJvdXRlKHBhcmFtZXRlcnMpXG4gICAgICAgIGlmIEBwYXJlbnRcbiAgICAgICAgICBAcGFyZW50LmFjdGl2YXRlIHBhcmFtZXRlcnMsIEAsIGFjdGl2YXRpb25Qcm9taXNlXG4gICAgICAgICAgLnRoZW4gKHBhcmVudFJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgICAgIEBkb1Jlc29sdmUgcGFyYW1ldGVycywgcGFyZW50UmVzb2x2ZVJlc3VsdFxuICAgICAgICAgICAgLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UucmVzb2x2ZSByZXNvbHZlUmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZG9SZXNvbHZlIHBhcmFtZXRlcnNcbiAgICAgICAgICAudGhlbiAocmVzb2x2ZVJlc3VsdCk9PlxuICAgICAgICAgICAgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVSZXN1bHRcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlLnJlc29sdmUgcmVzb2x2ZVJlc3VsdFxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcbiAgICAgICAgQGlzQWN0aXZlID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlUHJvbWlzZS5yZXNvbHZlIEBwcmV2aW91c1Jlc29sdmVSZXN1bHRcbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHQpPT5cbiAgICAgICAgQG9uQWN0aXZhdGU/IHBhcmFtZXRlcnMsIHJlc29sdmVSZXN1bHRcbiAgICAgIEBjdXJyZW50UGFyYW1ldGVycyA9IHBhcmFtZXRlcnNcbiAgICAgIHJldHVybiByZXNvbHZlUHJvbWlzZVxuXG4gICAgZGVhY3RpdmF0ZTogKCktPlxuICAgICAgQGlzQWN0aXZlID0gZmFsc2VcbiAgICAgIEBvbkRlYWN0aXZhdGU/KClcbiAgICAgIEBjdXJyZW50Q2hpbGQ/LmRlYWN0aXZhdGUoKVxuICAgICAgQGN1cnJlbnRDaGlsZCA9IG51bGxcblxuICAgIGdlbmVyYXRlUm91dGU6IChwYXJhbWV0ZXJzKS0+XG4gICAgICAoQHBhcmVudD8uZ2VuZXJhdGVSb3V0ZShwYXJhbWV0ZXJzKSA/ICcnKSArIGlmIEByb3V0ZSB0aGVuICcvJytfLnRlbXBsYXRlKEByb3V0ZSkocGFyYW1ldGVycylcblxuICAgIGdlbmVyYXRlUm91dGVTdHJpbmc6ICgpLT5cbiAgICAgIChAcGFyZW50Py5nZW5lcmF0ZVJvdXRlU3RyaW5nKCkgPyAnJykgKyBpZiBAcm91dGUgdGhlbiAnLycrQHJvdXRlIGVsc2UgJydcblxuICAgIGdlbmVyYXRlTmFtZTogKCktPlxuICAgICAgKGlmIEBwYXJlbnQgYW5kIEBwYXJlbnQuc3RhdGVuYW1lIHRoZW4gQHBhcmVudC5nZW5lcmF0ZU5hbWUoKSArICcuJyBlbHNlICcnKSArIEBzdGF0ZW5hbWVcblxuICAgIGdldFBhcmVudENoYWluOiAtPlxuICAgICAgdW5sZXNzIEBwYXJlbnRcbiAgICAgICAgcmV0dXJuIFtAXVxuICAgICAgY2hhaW4gPSBAcGFyZW50LmdldFBhcmVudENoYWluKClcbiAgICAgIGNoYWluLnB1c2ggQFxuICAgICAgcmV0dXJuIGNoYWluXG4iXX0=