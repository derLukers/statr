define 'State', ['StateManager'], (StateManager) ->
  'use strict'

  insertParameters = (string, parameters)->
    result = string

    for parameter, value of parameters
      result = result.replace ":#{parameter}", value

    return result

  defer = ()->
    result = {}
    result.promise = new Promise (resolve, reject)->
      result.resolve = resolve
      result.reject = reject
    return result

  class State
    isActive: false

    constructor: ->
      StateManager.registerState @

    insertParameters: insertParameters

    doResolve: (parameters, parentResolveResults={}) ->
      resultPromise = new Promise (resolve, reject)=>
        unless @resolve
          resolve parentResolveResults
          return resultPromise
        else
          subPromiseList = []
          for name, resolveFunction of @resolve
            deferred = resolveFunction parameters, parentResolveResults
            deferred.name = name
            subPromiseList.push deferred
          (Promise.all subPromiseList).then =>
            for index, subPromise of subPromiseList
              parentResolveResults[subPromise.name] = arguments[index]
            resolve parentResolveResults
      return resultPromise

    activate: (parameters, child=null, activationPromise=defer()) ->
      initial = child == null
      resolvePromise = defer()

      if initial
        resolvePromise.promise.then (resolveResult) ->
          activationPromise.resolve resolveResult

      unless @currentChild == child
        @currentChild?.deactivate()
        @currentChild = child

      unless @isActive and @generateRoute(@currentParameters) == @generateRoute(parameters)
        if @parent
          @parent.activate parameters, @, activationPromise
          .then (parentResolveResult) =>
            @doResolve parameters, parentResolveResult
            .then (resolveResult) =>
              @previousResolveResult = resolveResult
              resolvePromise.resolve resolveResult
        else
          @doResolve parameters
          .then (resolveResult) =>
            @previousResolveResult = resolveResult
            resolvePromise.resolve resolveResult

      else
        resolvePromise.resolve @previousResolveResult

      activationPromise.promise.then (resolveResult) =>
        @currentChild = child
        @isActive = true
        @onActivate? parameters, resolveResult

      @currentParameters = parameters
      return resolvePromise.promise

    deactivate: ->
      @isActive = false
      @onDeactivate?()
      @currentChild?.deactivate()
      @currentChild = null

    generateRoute: (parameters) ->
      "#{[@parent.generateRoute(parameters) + '/' if @parent?.generateRoute(parameters).length]}" +
      "#{[insertParameters(@route, parameters) if @route]}"

    generateRouteString: ->
      "#{["#{@parent.generateRouteString()}#{'/' if @route}" if @parent?.generateRouteString().length]}#{[@route]}"

    generateName: ->
      "#{[@parent.generateName() + '.' if @parent?.statename]}#{@statename}"

    getParentChain: ->
      chain = @parent?.getParentChain() or []
      chain.push @
      return chain
