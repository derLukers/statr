define 'StateManager', ['backbone'], (Backbone)->
  new class StateManager
    states = {}
    activeState = null
    router: new Backbone.Router()
    go: (name, parameters={}, options = {navigate: true}) ->
      unless states[name]
        throw new Error 'No State with name "' + name + "' found."
      state = states[name]
      state.activate parameters
      activeState = state
      if options.navigate && !state.abstract && state.route
        @router.navigate state.generateRoute parameters

    registerState: (state) ->
      name = state.generateName()
      if states[state.generateName()]
        throw new Error('State with name "' + name + '" already exists.')
      states[state.generateName()] = state
      if (state.route or state.route=='') && !state.abstract
        @router.route state.generateRouteString(), state.generateName(),
          ->
            _arguments = arguments
            parameters = {}
            for name, index in (state.generateRouteString().match(/:([a-zA-Z0-9\-_]+)/g))
              parameters[name.substring(1)] = _arguments[index]
            state.activate parameters

    getState: (name)->
      states[name]

    clear: ()->
      activeState?.getParentChain()[0].deactivate()
      states = {}

    constructor: ->
      @clear()