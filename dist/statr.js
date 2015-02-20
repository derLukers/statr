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

    State.prototype.mixins = [];

    function State() {
      this.use(this.mixins.length ? this.mixins : [this.mixins]);
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

    State.prototype.use = function(mixins) {
      var i, key, len, mixin, ref, value;
      for (i = 0, len = mixins.length; i < len; i++) {
        mixin = mixins[i];
        ref = mixin.prototype;
        for (key in ref) {
          value = ref[key];
          if (key !== 'constructor') {
            this[key] = value;
          }
        }
        if (mixin != null) {
          if (typeof mixin.call === "function") {
            mixin.call(this);
          }
        }
      }
      return this;
    };

    return State;

  })();
});

//# sourceMappingURL=data:application/json;base64,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QTlGTCxDQUFBOztpQkFBQTs7T0FYOEI7QUFBQSxDQUFsQyxDQUFBLENBQUEiLCJmaWxlIjoiU3RhdGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUgJ1N0YXRlJywgWydTdGF0ZU1hbmFnZXInXSwgKFN0YXRlTWFuYWdlcikgLT5cbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZGVmZXIgPSAoKS0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpLT5cbiAgICAgIHJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdFxuICAgIHJldHVybiByZXN1bHRcblxuICBjbGFzcyBTdGF0ZVxuICAgIGlzQWN0aXZlOiBmYWxzZVxuICAgIG1peGluczogW11cblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgQHVzZSBpZiBAbWl4aW5zLmxlbmd0aCB0aGVuIEBtaXhpbnMgZWxzZSBbQG1peGluc11cbiAgICAgIFN0YXRlTWFuYWdlci5yZWdpc3RlclN0YXRlIEBcblxuICAgIGFjdGl2YXRpb25Ib29rczogW11cblxuICAgIGRvUmVzb2x2ZTogKHBhcmFtZXRlcnMsIHBhcmVudFJlc29sdmVSZXN1bHRzPXt9KSAtPlxuICAgICAgcmVzdWx0UHJvbWlzZSA9IGRlZmVyKClcbiAgICAgIHVubGVzcyBAcmVzb2x2ZVxuICAgICAgICByZXN1bHRQcm9taXNlLnJlc29sdmUocGFyZW50UmVzb2x2ZVJlc3VsdHMpXG4gICAgICAgIHJldHVybiByZXN1bHRQcm9taXNlLnByb21pc2VcbiAgICAgIGVsc2VcbiAgICAgICAgc3ViUHJvbWlzZUxpc3QgPSBbXVxuICAgICAgICBmb3IgbmFtZSwgcmVzb2x2ZUZ1bmN0aW9uIG9mIEByZXNvbHZlXG4gICAgICAgICAgcmVzb2x2ZVJlc3VsdCA9IHJlc29sdmVGdW5jdGlvbihwYXJhbWV0ZXJzLCBwYXJlbnRSZXNvbHZlUmVzdWx0cykgfHwge31cbiAgICAgICAgICByZXNvbHZlUmVzdWx0Lm5hbWUgPSBuYW1lXG4gICAgICAgICAgc3ViUHJvbWlzZUxpc3QucHVzaCByZXNvbHZlUmVzdWx0XG4gICAgICAgIFByb21pc2UuYWxsKHN1YlByb21pc2VMaXN0KS50aGVuID0+XG4gICAgICAgICAgZm9yIGluZGV4LCBzdWJQcm9taXNlIG9mIHN1YlByb21pc2VMaXN0XG4gICAgICAgICAgICBwYXJlbnRSZXNvbHZlUmVzdWx0c1tzdWJQcm9taXNlLm5hbWVdID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICAgIEBwcmV2aW91c1Jlc29sdmVSZXN1bHQgPSBwYXJlbnRSZXNvbHZlUmVzdWx0c1xuICAgICAgICAgIHJlc3VsdFByb21pc2UucmVzb2x2ZShwYXJlbnRSZXNvbHZlUmVzdWx0cylcbiAgICAgIHJldHVybiByZXN1bHRQcm9taXNlLnByb21pc2VcblxuICAgIGFjdGl2YXRlOiAocGFyYW1ldGVycywgY2hpbGQ9bnVsbCwgcmVzb2x2ZVByb21pc2U9ZGVmZXIoKSktPlxuICAgICAgaW5pdGlhbCA9IGNoaWxkID09IG51bGxcbiAgICAgIGlubmVyUmVzb2x2ZVByb21pc2UgPSBkZWZlcigpXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGRlZmVyKClcblxuICAgICAgdW5sZXNzIEBjdXJyZW50Q2hpbGQgPT0gY2hpbGRcbiAgICAgICAgQGN1cnJlbnRDaGlsZD8uZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBjdXJyZW50Q2hpbGQgPSBjaGlsZFxuXG4gICAgICBpZiBpbml0aWFsXG4gICAgICAgIGlubmVyUmVzb2x2ZVByb21pc2UucHJvbWlzZS50aGVuIHJlc29sdmVQcm9taXNlLnJlc29sdmUsIHJlc29sdmVQcm9taXNlLnJlamVjdFxuXG4gICAgICBpbm5lclJlc29sdmVQcm9taXNlLnByb21pc2UudGhlbiAocmVzb2x2ZVJlc3VsdCk9PlxuICAgICAgICBAcHJldmlvdXNSZXNvbHZlUmVzdWx0ID0gcmVzb2x2ZVJlc3VsdFxuXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZS5wcm9taXNlLnRoZW4gKCk9PlxuICAgICAgICBAY3VycmVudENoaWxkID0gY2hpbGRcbiAgICAgICAgQGlzQWN0aXZlID0gdHJ1ZVxuICAgICAgICBAY3VycmVudFBhcmFtcyA9IHBhcmFtZXRlcnNcblxuICAgICAgdW5sZXNzIEBpc0FjdGl2ZSBhbmQgQHBhcmFtc1VuY2hhbmdlZChwYXJhbWV0ZXJzKVxuICAgICAgICBpZiBAcGFyZW50XG4gICAgICAgICAgcGFyZW50QWN0aXZhdGVSZXN1bHQgPSBAcGFyZW50LmFjdGl2YXRlKHBhcmFtZXRlcnMsIEAsIHJlc29sdmVQcm9taXNlKVxuICAgICAgICAgIHBhcmVudEFjdGl2YXRlUmVzdWx0WzBdLnRoZW4gKHJlc29sdmVSZXN1bHRzKT0+XG4gICAgICAgICAgICBAZG9SZXNvbHZlKHBhcmFtZXRlcnMsIHJlc29sdmVSZXN1bHRzKS50aGVuIGlubmVyUmVzb2x2ZVByb21pc2UucmVzb2x2ZSwgaW5uZXJSZXNvbHZlUHJvbWlzZS5yZWplY3RcbiAgICAgICAgICBwYXJlbnRBY3RpdmF0ZVJlc3VsdFsxXS50aGVuIChyZXNvbHZlUmVzdWx0cyk9PlxuICAgICAgICAgICAgQGV4ZWN1dGVBY3RpdmF0aW9uSG9va3MocGFyYW1ldGVycywgcmVzb2x2ZVJlc3VsdHMpXG4gICAgICAgICAgICAudGhlbiBhY3RpdmF0aW9uUHJvbWlzZS5yZXNvbHZlLCBhY3RpdmF0aW9uUHJvbWlzZS5yZWplY3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkb1Jlc29sdmUocGFyYW1ldGVycykudGhlbiBpbm5lclJlc29sdmVQcm9taXNlLnJlc29sdmVcbiAgICAgICAgICByZXNvbHZlUHJvbWlzZS5wcm9taXNlLnRoZW4gKHJlc29sdmVSZXN1bHRzKT0+XG4gICAgICAgICAgICBAZXhlY3V0ZUFjdGl2YXRpb25Ib29rcyhwYXJhbWV0ZXJzLCByZXNvbHZlUmVzdWx0cylcbiAgICAgICAgICAgIC50aGVuIGFjdGl2YXRpb25Qcm9taXNlLnJlc29sdmUsIGFjdGl2YXRpb25Qcm9taXNlLnJlamVjdFxuICAgICAgZWxzZVxuICAgICAgICBpbm5lclJlc29sdmVQcm9taXNlLnJlc29sdmUgQHByZXZpb3VzUmVzb2x2ZVJlc3VsdFxuICAgICAgICByZXNvbHZlUHJvbWlzZS5wcm9taXNlLnRoZW4gYWN0aXZhdGlvblByb21pc2UucmVzb2x2ZSwgYWN0aXZhdGlvblByb21pc2UucmVqZWN0XG5cbiAgICAgIHVubGVzcyBpbml0aWFsXG4gICAgICAgIHJldHVybiBbaW5uZXJSZXNvbHZlUHJvbWlzZS5wcm9taXNlLCBhY3RpdmF0aW9uUHJvbWlzZS5wcm9taXNlXVxuICAgICAgcmV0dXJuIGFjdGl2YXRpb25Qcm9taXNlLnByb21pc2VcblxuICAgIHBhcmFtc1VuY2hhbmdlZDogKHBhcmFtcywgY3VycmVudFBhcmFtcyA9IEBjdXJyZW50UGFyYW1zIHx8IHt9KS0+XG4gICAgICB1bmxlc3MgcGFyYW1zXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gW3BhcmFtc1tuYW1lXSA9PSB2YWx1ZSBmb3IgbmFtZSwgdmFsdWUgaW4gY3VycmVudFBhcmFtc10uZXZlcnkgKHgpLT54PT10cnVlXG5cbiAgICBleGVjdXRlQWN0aXZhdGlvbkhvb2tzOiAocGFyYW1zLCByZXNvbHZlUmVzdWx0cykgLT5cbiAgICAgIGhvb2twcm9taXNlcyA9IFtob29rKHBhcmFtcywgcmVzb2x2ZVJlc3VsdHMpIGZvciBob29rIGluIEBhY3RpdmF0aW9uSG9va3NdXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoaG9va3Byb21pc2VzKVxuXG4gICAgZGVhY3RpdmF0ZTogLT5cbiAgICAgIEBpc0FjdGl2ZSA9IGZhbHNlXG4gICAgICBAY3VycmVudENoaWxkPy5kZWFjdGl2YXRlKClcbiAgICAgIEBvbkRlYWN0aXZhdGU/KClcbiAgICAgIEBjdXJyZW50Q2hpbGQgPSBudWxsXG5cbiAgICBvbkFjdGl2YXRlOiAoY2IpLT5cbiAgICAgIEBhY3RpdmF0aW9uSG9va3MucHVzaChjYilcblxuICAgIGdlbmVyYXRlTmFtZTogLT5cbiAgICAgIFwiI3tbQHBhcmVudC5nZW5lcmF0ZU5hbWUoKSArICcuJyBpZiBAcGFyZW50Py5zdGF0ZW5hbWVdfSN7QHN0YXRlbmFtZX1cIlxuXG4gICAgZ2V0UGFyZW50Q2hhaW46IC0+XG4gICAgICBjaGFpbiA9IEBwYXJlbnQ/LmdldFBhcmVudENoYWluKCkgb3IgW11cbiAgICAgIGNoYWluLnB1c2ggQFxuICAgICAgcmV0dXJuIGNoYWluXG5cbiAgICB1c2U6IChtaXhpbnMpIC0+XG4gICAgICBmb3IgbWl4aW4gaW4gbWl4aW5zXG4gICAgICAgIEBba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIChtaXhpbjo6KSB3aGVuIGtleSBpc250ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgbWl4aW4/LmNhbGw/IEBcbiAgICAgIHJldHVybiBAXG4iXX0=
define('StateManager', [], function() {
  var StateManager;
  return new (StateManager = (function() {
    var activeState, states;

    states = {};

    activeState = null;

    StateManager.prototype.go = function(name, parameters) {
      var state;
      if (parameters == null) {
        parameters = {};
      }
      if (!states[name]) {
        throw new Error("No State with name \"" + name + "\" found.");
      }
      state = states[name];
      activeState = state;
      return state.activate(parameters);
    };

    StateManager.prototype.registerState = function(state) {
      var name;
      name = state.generateName();
      if (states[state.generateName()]) {
        throw new Error('State with name "' + name + '" already exists.');
      }
      return states[state.generateName()] = state;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXRlTWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBQSxDQUFPLGNBQVAsRUFBdUIsRUFBdkIsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLE1BQUEsWUFBQTtTQUFBLEdBQUEsQ0FBQSxDQUFVO0FBQ1IsUUFBQSxtQkFBQTs7QUFBQSxJQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7O0FBQUEsSUFDQSxXQUFBLEdBQWMsSUFEZCxDQUFBOztBQUFBLDJCQUdBLEVBQUEsR0FBSSxTQUFDLElBQUQsRUFBTyxVQUFQLEdBQUE7QUFDRixVQUFBLEtBQUE7O1FBRFMsYUFBVztPQUNwQjtBQUFBLE1BQUEsSUFBQSxDQUFBLE1BQWMsQ0FBQSxJQUFBLENBQWQ7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLHVCQUFBLEdBQXdCLElBQXhCLEdBQTZCLFdBQW5DLENBQVYsQ0FERjtPQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsTUFBTyxDQUFBLElBQUEsQ0FGZixDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsS0FIZCxDQUFBO0FBSUEsYUFBTyxLQUFLLENBQUMsUUFBTixDQUFlLFVBQWYsQ0FBUCxDQUxFO0lBQUEsQ0FISixDQUFBOztBQUFBLDJCQVVBLGFBQUEsR0FBZSxTQUFDLEtBQUQsR0FBQTtBQUNiLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxZQUFOLENBQUEsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFHLE1BQU8sQ0FBQSxLQUFLLENBQUMsWUFBTixDQUFBLENBQUEsQ0FBVjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sbUJBQUEsR0FBc0IsSUFBdEIsR0FBNkIsbUJBQW5DLENBQVYsQ0FERjtPQURBO2FBR0EsTUFBTyxDQUFBLEtBQUssQ0FBQyxZQUFOLENBQUEsQ0FBQSxDQUFQLEdBQStCLE1BSmxCO0lBQUEsQ0FWZixDQUFBOztBQUFBLDJCQWdCQSxRQUFBLEdBQVUsU0FBQyxJQUFELEdBQUE7YUFDUixNQUFPLENBQUEsSUFBQSxFQURDO0lBQUEsQ0FoQlYsQ0FBQTs7QUFBQSwyQkFtQkEsS0FBQSxHQUFPLFNBQUEsR0FBQTs7UUFDTCxXQUFXLENBQUUsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBakMsQ0FBQTtPQUFBO2FBQ0EsTUFBQSxHQUFTLEdBRko7SUFBQSxDQW5CUCxDQUFBOztBQXVCYSxJQUFBLHNCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQURXO0lBQUEsQ0F2QmI7O3dCQUFBOztRQUZ1QjtBQUFBLENBQTNCLENBQUEsQ0FBQSIsImZpbGUiOiJTdGF0ZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUgJ1N0YXRlTWFuYWdlcicsIFtdLCAoKS0+XG4gIG5ldyBjbGFzcyBTdGF0ZU1hbmFnZXJcbiAgICBzdGF0ZXMgPSB7fVxuICAgIGFjdGl2ZVN0YXRlID0gbnVsbFxuXG4gICAgZ286IChuYW1lLCBwYXJhbWV0ZXJzPXt9KSAtPlxuICAgICAgdW5sZXNzIHN0YXRlc1tuYW1lXVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJObyBTdGF0ZSB3aXRoIG5hbWUgXFxcIiN7bmFtZX1cXFwiIGZvdW5kLlwiXG4gICAgICBzdGF0ZSA9IHN0YXRlc1tuYW1lXVxuICAgICAgYWN0aXZlU3RhdGUgPSBzdGF0ZVxuICAgICAgcmV0dXJuIHN0YXRlLmFjdGl2YXRlIHBhcmFtZXRlcnNcblxuICAgIHJlZ2lzdGVyU3RhdGU6IChzdGF0ZSkgLT5cbiAgICAgIG5hbWUgPSBzdGF0ZS5nZW5lcmF0ZU5hbWUoKVxuICAgICAgaWYgc3RhdGVzW3N0YXRlLmdlbmVyYXRlTmFtZSgpXVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0YXRlIHdpdGggbmFtZSBcIicgKyBuYW1lICsgJ1wiIGFscmVhZHkgZXhpc3RzLicpXG4gICAgICBzdGF0ZXNbc3RhdGUuZ2VuZXJhdGVOYW1lKCldID0gc3RhdGVcblxuICAgIGdldFN0YXRlOiAobmFtZSktPlxuICAgICAgc3RhdGVzW25hbWVdXG5cbiAgICBjbGVhcjogKCktPlxuICAgICAgYWN0aXZlU3RhdGU/LmdldFBhcmVudENoYWluKClbMF0uZGVhY3RpdmF0ZSgpXG4gICAgICBzdGF0ZXMgPSB7fVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBAY2xlYXIoKSJdfQ==