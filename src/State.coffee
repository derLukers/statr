((root, factory) ->
  if typeof define == 'function' and define.amd
    define 'State', ['StateManager'], (StateManager) ->
      root.State = (factory StateManager)
    return
  else if typeof exports != 'undefined'
    StateManager = require 'StateManager'
    exports.State = (factory StateManager)
    if typeof module != 'undefined' and module.exports
      exports = module.exports = (factory StateManager)
  else
    root.State = (factory StateManager)
) @, (StateManager) ->
  'use strict'

  insertParameters = (string, parameters)->
    result = string

    for parameter, value of parameters
      result = result.replace ":#{parameter}", value

    return result

  class State
    isActive: false

    constructor: ->
      StateManager.registerState @

    insertParameters: insertParameters

    doResolve: (parameters, parentResolveResults={}) ->
      resultPromise = $.Deferred()
      unless @resolve
        resultPromise.resolve parentResolveResults
        return resultPromise
      else
        subPromiseList = []
        for name, resolveFunction of @resolve
          deferred = resolveFunction parameters, parentResolveResults
          deferred.name = name
          subPromiseList.push deferred
        ($.when.apply $, subPromiseList).then ->
          for index, subPromise of subPromiseList
            parentResolveResults[subPromise.name] = arguments[index]
          resultPromise.resolve parentResolveResults
      return resultPromise

    activate: (parameters, child=null, activationPromise=$.Deferred()) ->
      initial = child == null
      resolvePromise = $.Deferred()

      if initial
        resolvePromise.then (resolveResult) ->
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

      activationPromise.then (resolveResult) =>
        @currentChild = child
        @isActive = true
        @onActivate? parameters, resolveResult

      @currentParameters = parameters
      return resolvePromise

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
