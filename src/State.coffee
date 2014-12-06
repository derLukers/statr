define [
  './StateManager'
  'require'
  'underscore'
], (StateManager, require, _) ->
  'use strict'
  _.templateSettings =
    interpolate: /:([a-zA-Z0-9_]+)/g

  class State
    isActive: false

    constructor: ()->
      StateManager.registerState @

    doResolve: (parameters, parentResolveResults = {})->
      resultPromise = $.Deferred()
      unless @resolve
        resultPromise.resolve parentResolveResults
        return resultPromise
      else
        subPromiseList = []
        for name, resolveFunction of @resolve
          deferred = resolveFunction.apply @, parameters, parentResolveResults
          deferred.name = name
          subPromiseList.push deferred
        ($.when.apply $, subPromiseList).then ()->
          for index, subPromise of subPromiseList
            parentResolveResults[subPromise.name] = arguments[index]
          resultPromise.resolve parentResolveResults
      resultPromise

    activate: (parameters, child = null, activationPromise = $.Deferred())->
      initial = child == null
      resolvePromise = $.Deferred()
      if initial
        resolvePromise.then (resolveResult)->
          activationPromise.resolve resolveResult
      unless @currentChild == child
        @currentChild?.deactivate()
        @currentChild = child
      unless @isActive and @generateRoute(@currentParameters) == @generateRoute(parameters)
        if @parent
          @parent.activate parameters, @, activationPromise
          .then (parentResolveResult)=>
            @doResolve parameters, parentResolveResult
            .then (resolveResult)=>
              @previousResolveResult = resolveResult
              resolvePromise.resolve resolveResult
        else
          @doResolve parameters
          .then (resolveResult)=>
            @previousResolveResult = resolveResult
            resolvePromise.resolve resolveResult
        @currentChild = child
        @isActive = true
      else
        resolvePromise.resolve @previousResolveResult
      activationPromise.then (resolveResult)=>
        @onActivate? parameters, resolveResult
      @currentParameters = parameters
      return resolvePromise

    deactivate: ()->
      @isActive = false
      @onDeactivate?()
      @currentChild?.deactivate()
      @currentChild = null

    generateRoute: (parameters)->
      (if @parent?.generateRoute(parameters).length then @parent.generateRoute(parameters)+'/' else '') + if @route then _.template(@route)(parameters) else ''

    generateRouteString: ()->
      (if @parent?.generateRouteString().length then @parent.generateRouteString() + (if @route then '/' else '') else '') + if @route then @route else ''

    generateName: ()->
      (if @parent?.statename then @parent.generateName() + '.' else '') + @statename

    getParentChain: ->
      chain = @parent?.getParentChain() or []
      chain.push @
      return chain
