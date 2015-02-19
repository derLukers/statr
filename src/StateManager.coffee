define 'StateManager', [], ()->
  new class StateManager
    states = {}
    activeState = null

    go: (name, parameters={}) ->
      unless states[name]
        throw new Error "No State with name \"#{name}\" found."
      state = states[name]
      activeState = state
      return state.activate parameters

    registerState: (state) ->
      name = state.generateName()
      if states[state.generateName()]
        throw new Error('State with name "' + name + '" already exists.')
      states[state.generateName()] = state

    getState: (name)->
      states[name]

    clear: ()->
      activeState?.getParentChain()[0].deactivate()
      states = {}

    constructor: ->
      @clear()