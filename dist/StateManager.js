define('StateManager', ['backbone'], function(Backbone) {
  var StateManager;
  return new (StateManager = (function() {
    var activeState, states;

    states = {};

    activeState = null;

    StateManager.prototype.router = new Backbone.Router();

    StateManager.prototype.go = function(name, parameters, options) {
      var state;
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
      state.activate(parameters);
      activeState = state;
      if (options.navigate && !state.abstract && state.route) {
        return this.router.navigate(state.generateRoute(parameters));
      }
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
          var index, parameters, _arguments, _i, _len, _ref;
          _arguments = arguments;
          parameters = {};
          _ref = state.generateRouteString().match(/:([a-zA-Z0-9\-_]+)/g);
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            name = _ref[index];
            parameters[name.substring(1)] = _arguments[index];
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

//# sourceMappingURL=data:application/json;base64,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QUFBLEdBQVMsR0FGSjtJQUFBLENBN0JQLENBQUE7O0FBaUNhLElBQUEsc0JBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBRFc7SUFBQSxDQWpDYjs7d0JBQUE7O1FBRmlDO0FBQUEsQ0FBckMsQ0FBQSxDQUFBIiwiZmlsZSI6IlN0YXRlTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSAnU3RhdGVNYW5hZ2VyJywgWydiYWNrYm9uZSddLCAoQmFja2JvbmUpLT5cbiAgbmV3IGNsYXNzIFN0YXRlTWFuYWdlclxuICAgIHN0YXRlcyA9IHt9XG4gICAgYWN0aXZlU3RhdGUgPSBudWxsXG4gICAgcm91dGVyOiBuZXcgQmFja2JvbmUuUm91dGVyKClcbiAgICBnbzogKG5hbWUsIHBhcmFtZXRlcnM9e30sIG9wdGlvbnMgPSB7bmF2aWdhdGU6IHRydWV9KSAtPlxuICAgICAgdW5sZXNzIHN0YXRlc1tuYW1lXVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ05vIFN0YXRlIHdpdGggbmFtZSBcIicgKyBuYW1lICsgXCInIGZvdW5kLlwiXG4gICAgICBzdGF0ZSA9IHN0YXRlc1tuYW1lXVxuICAgICAgc3RhdGUuYWN0aXZhdGUgcGFyYW1ldGVyc1xuICAgICAgYWN0aXZlU3RhdGUgPSBzdGF0ZVxuICAgICAgaWYgb3B0aW9ucy5uYXZpZ2F0ZSAmJiAhc3RhdGUuYWJzdHJhY3QgJiYgc3RhdGUucm91dGVcbiAgICAgICAgQHJvdXRlci5uYXZpZ2F0ZSBzdGF0ZS5nZW5lcmF0ZVJvdXRlIHBhcmFtZXRlcnNcblxuICAgIHJlZ2lzdGVyU3RhdGU6IChzdGF0ZSkgLT5cbiAgICAgIG5hbWUgPSBzdGF0ZS5nZW5lcmF0ZU5hbWUoKVxuICAgICAgaWYgc3RhdGVzW3N0YXRlLmdlbmVyYXRlTmFtZSgpXVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0YXRlIHdpdGggbmFtZSBcIicgKyBuYW1lICsgJ1wiIGFscmVhZHkgZXhpc3RzLicpXG4gICAgICBzdGF0ZXNbc3RhdGUuZ2VuZXJhdGVOYW1lKCldID0gc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5yb3V0ZSBvciBzdGF0ZS5yb3V0ZT09JycpICYmICFzdGF0ZS5hYnN0cmFjdFxuICAgICAgICBAcm91dGVyLnJvdXRlIHN0YXRlLmdlbmVyYXRlUm91dGVTdHJpbmcoKSwgc3RhdGUuZ2VuZXJhdGVOYW1lKCksXG4gICAgICAgICAgLT5cbiAgICAgICAgICAgIF9hcmd1bWVudHMgPSBhcmd1bWVudHNcbiAgICAgICAgICAgIHBhcmFtZXRlcnMgPSB7fVxuICAgICAgICAgICAgZm9yIG5hbWUsIGluZGV4IGluIChzdGF0ZS5nZW5lcmF0ZVJvdXRlU3RyaW5nKCkubWF0Y2goLzooW2EtekEtWjAtOVxcLV9dKykvZykpXG4gICAgICAgICAgICAgIHBhcmFtZXRlcnNbbmFtZS5zdWJzdHJpbmcoMSldID0gX2FyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgICAgIHN0YXRlLmFjdGl2YXRlIHBhcmFtZXRlcnNcblxuICAgIGdldFN0YXRlOiAobmFtZSktPlxuICAgICAgc3RhdGVzW25hbWVdXG5cbiAgICBjbGVhcjogKCktPlxuICAgICAgYWN0aXZlU3RhdGU/LmdldFBhcmVudENoYWluKClbMF0uZGVhY3RpdmF0ZSgpXG4gICAgICBzdGF0ZXMgPSB7fVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBAY2xlYXIoKSJdfQ==