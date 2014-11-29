define [
  './State', 'underscore', 'marionette'
], (State, _, marionette) ->
  router = new Marionette.AppRouter()
  window.foo = new class StateManager
    states: {}
    routeTo: (name, parameters) ->
      unless @states[name]
        throw new Error 'No State with name "' + name + "' found."
      state = @states[name]
      router.navigate state.generateRoute name, parameters

    registerState: (state) ->
      @states[state.generateName()] = state
      console.log state.generateName()
      unless state.noRoute
        router.route state.generateRouteString(), state.generateName(), (parameters)->
          console.log 'routing to ' + state.generateName()
          _arguments = arguments
          parameters = _.object _.map state.generateRouteString().match(/:([a-zA-Z0-9\-_]+)/g), (name, index)->
            [name.substring(1), _arguments[index]]
          state.activate parameters

    getState: (name)->
      @states[name]