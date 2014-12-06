###
  # State

  The [Angular ui.router Team describes](https://github.com/angular-ui/ui-router/wiki) states as:
  > ... a "place" in the application in terms of the overall UI and navigation.
  This place is both

###
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
      unless @currentChild == child #foo
        @currentChild?.deactivate()
        @currentChild = child
      unless @isActive && @generateRoute(@currentParameters) == @generateRoute(parameters)
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
      (@parent?.generateRoute(parameters) ? '') + if @route then '/'+_.template(@route)(parameters)

    generateRouteString: ()->
      (@parent?.generateRouteString() ? '') + if @route then '/'+@route else ''

    generateName: ()->
      (if @parent and @parent.statename then @parent.generateName() + '.' else '') + @statename

    getParentChain: ->
      unless @parent
        return [@]
      chain = @parent.getParentChain()
      chain.push @
      return chain
