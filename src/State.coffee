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
      resultPromise = defer()
      unless @resolve
        resultPromise.resolve(parentResolveResults)
        return resultPromise.promise
      else
        subPromiseList = []
        for name, resolveFunction of @resolve
          deferred = resolveFunction parameters, parentResolveResults
          deferred.name = name
          subPromiseList.push deferred
        Promise.all(subPromiseList).then ->
          for index, subPromise of subPromiseList
            parentResolveResults[subPromise.name] = arguments[index]
          @previousResolveResult = parentResolveResults
          resultPromise.resolve(parentResolveResults)
      return resultPromise.promise

    activate: (parameters, child=null, resolvePromise=defer())->
      initial = child == null
      innerResolvePromise = defer()
      activationPromise = defer()

      unless @currentChild == child
        @currentChild?.deactivate()
        @currentChild = child

      if initial
        innerResolvePromise.promise.then resolvePromise.resolve, resolvePromise.reject

      innerResolvePromise.promise.then ()=>
        @previousResolveResult = resolveResult

      resolvePromise.promise.then ()=>
        @currentChild = child
        @isActive = true
        @currentParams = parameters

      unless @isActive and @paramsUnchanged(parameters)
        if @parent
          parentActivateResult = @parent.activate(parameters, @, resolvePromise)
          parentActivateResult[0].then (resolveResults)=>
            @doResolve(parameters, resolveResults).then innerResolvePromise.resolve, innerResolvePromise.reject
          parentActivateResult[1].then (resolveResults)=>
            @onActivate?(parameters, resolveResults)
            activationPromise.resolve(resolveResults)
        else
          @doResolve(parameters).then innerResolvePromise.resolve
          resolvePromise.promise.then (resolveResults)=>
            @onActivate?(parameters, resolveResults)
            activationPromise.resolve(resolveResults)
      else
        innerResolvePromise.resolve @previousResolveResult
        resolvePromise.promise.then activationPromise.resolve, activationPromise.reject

      unless initial
        return [innerResolvePromise.promise, activationPromise.promise]
      return activationPromise.promise

    paramsUnchanged: (params)-> [params[name] == value for name, value in @currentParams].every (x)->x==true

    deactivate: ->
      @isActive = false
      @currentChild?.deactivate()
      @onDeactivate?()
      @currentChild = null

    generateRoute: (parameters) ->
      "#{[@parent.generateRoute(parameters) +
            '/' if @parent?.generateRoute(parameters).length]}" +
      "#{[insertParameters(@route, parameters) if @route]}"

    generateRouteString: ->
      "#{["#{@parent.generateRouteString()}#{'/' if @route}
      "if @parent?.generateRouteString().length]}#{[@route]}"

    generateName: ->
      "#{[@parent.generateName() + '.' if @parent?.statename]}#{@statename}"

    getParentChain: ->
      chain = @parent?.getParentChain() or []
      chain.push @
      return chain
