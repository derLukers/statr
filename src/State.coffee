define 'State', ['StateManager'], (StateManager) ->
  'use strict'

  defer = ()->
    result = {}
    result.promise = new Promise (resolve, reject)->
      result.resolve = resolve
      result.reject = reject
    return result

  class State
    isActive: false
    mixins: []

    constructor: ->
      @use if @mixins.length then @mixins else [@mixins]
      StateManager.registerState @

    activationHooks: []

    doResolve: (parameters, parentResolveResults={}) ->
      resultPromise = defer()
      unless @resolve
        resultPromise.resolve(parentResolveResults)
        return resultPromise.promise
      else
        subPromiseList = []
        for name, resolveFunction of @resolve
          resolveResult = resolveFunction(parameters, parentResolveResults) || {}
          resolveResult.name = name
          subPromiseList.push resolveResult
        Promise.all(subPromiseList).then =>
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

      innerResolvePromise.promise.then (resolveResult)=>
        @previousResolveResult = resolveResult

      activationPromise.promise.then ()=>
        @currentChild = child
        @isActive = true
        @currentParams = parameters

      unless @isActive and @paramsUnchanged(parameters)
        if @parent
          parentActivateResult = @parent.activate(parameters, @, resolvePromise)
          parentActivateResult[0].then (resolveResults)=>
            @doResolve(parameters, resolveResults).then innerResolvePromise.resolve, innerResolvePromise.reject
          parentActivateResult[1].then (resolveResults)=>
            @executeActivationHooks(parameters, resolveResults)
            .then activationPromise.resolve, activationPromise.reject
        else
          @doResolve(parameters).then innerResolvePromise.resolve
          resolvePromise.promise.then (resolveResults)=>
            @executeActivationHooks(parameters, resolveResults)
            .then activationPromise.resolve, activationPromise.reject
      else
        innerResolvePromise.resolve @previousResolveResult
        resolvePromise.promise.then activationPromise.resolve, activationPromise.reject

      unless initial
        return [innerResolvePromise.promise, activationPromise.promise]
      return activationPromise.promise

    paramsUnchanged: (params, currentParams = @currentParams || {})->
      unless params
        return true
      return [params[name] == value for name, value in currentParams].every (x)->x==true

    executeActivationHooks: (params, resolveResults) ->
      hookpromises = [hook(params, resolveResults) for hook in @activationHooks]
      return Promise.all(hookpromises)

    deactivate: ->
      @isActive = false
      @currentChild?.deactivate()
      @onDeactivate?()
      @currentChild = null

    onActivate: (cb)->
      @activationHooks.push(cb)

    generateName: ->
      "#{[@parent.generateName() + '.' if @parent?.statename]}#{@statename}"

    getParentChain: ->
      chain = @parent?.getParentChain() or []
      chain.push @
      return chain

    use: (mixins) ->
      for mixin in mixins
        @[key] = value for key, value of (mixin::) when key isnt 'constructor'
        mixin?.call? @
      return @
