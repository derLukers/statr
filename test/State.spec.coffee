define [
  'State'
  'StateManager'
  'es6-promise'
], (State, StateManager, es6promise)->
  window.Promise = es6promise.Promise
  es6promise.polyfill()

  defer = ()->
    result = {}
    result.promise = new Promise (resolve, reject)->
      result.resolve = resolve
      result.reject = reject
    return result

  describe 'State', ->

    beforeEach ->
      StateManager.clear()

    describe 'name generation', ->
      namedstate = new class extends State
        statename: 'namedstate'
      namedstateA = new class extends State
        statename: 'a'
        parent: namedstate
      namedstateAB = new class extends State
        statename: 'b'
        parent: namedstateA
      namedstateB = new class extends State
        statename: 'b'
        parent: namedstate
      namedstateBA = new class extends State
        statename: 'a'
        parent: namedstateB
      namedstateBB = new class extends State
        statename: 'b'
        parent: namedstateB

      it 'should result in the correct name for state "namedstate"', ->
        expect(namedstate.generateName()).to.equal 'namedstate'
      it 'should result in the correct name for state "namedstate.a"', ->
        expect(namedstateA.generateName()).to.equal 'namedstate.a'
      it 'should result in the correct name for state "namedstate.a.b"', ->
        expect(namedstateAB.generateName()).to.equal 'namedstate.a.b'
      it 'should result in the correct name for state "namedstate.b"', ->
        expect(namedstateB.generateName()).to.equal 'namedstate.b'
      it 'should result in the correct name for state "namedstate.b.a"', ->
        expect(namedstateBA.generateName()).to.equal 'namedstate.b.a'
      it 'should result in the correct name for state "namedstate.b.b"', ->
        expect(namedstateBB.generateName()).to.equal 'namedstate.b.b'

    describe 'promise handling', ->
      it 'should resolve the states promises beforehand', (done)->
        deferred = defer()

        promiseTestState = new class extends State
          statename: 'promiseTestState'
          resolve:
            promise1: ->
              return deferred.promise

        expect(promiseTestState.isActive).not.to.be.true

        promiseTestState.activate()
        .then ->
          expect(promiseTestState.isActive).to.be.true
          done()

        expect(promiseTestState.isActive).not.to.be.true

        deferred.resolve('asd')

    describe 'activating states', ->
      it 'should call the activation handlers, when being activated', (done)->
        activationTestState = new class extends State
        activationTestState.onActivate ->
          done()
        activationTestState.activate()

      it 'should call the resolve functions only once when activating multiple times', (done)->
        resolvingState = new class extends State
          statename: 'resolvingstate'
          resolve:
            promise1: sinon.spy()

        resolvingState.activate()
        .then ->
          resolvingState.activate()
          .then ->
            expect(resolvingState.resolve.promise1.callCount).to.equal 1
            done()


    describe 'deactivating states', ->
      it 'should deactivate all substates, when being deactivated', (done)->
        deactivatingState = new class extends State
          statename: 'deactivatingState'
        deactivatingStateChildA = new class extends State
          statename: 'deactivatingStateChildA'
          parent: deactivatingState
        deactivatingStateChildB = new class extends State
          statename: 'deactivatingStateChildB'
          parent: deactivatingState

        deactivatingStateChildA.activate()
        .then ->
          expect(deactivatingState.isActive).to.be.true
          deactivatingState.deactivate()
          expect(deactivatingState.isActive).to.be.false
          done()
        , (reason)->
          fail(reason)
          done()

      it 'should call the on deactivate function, when a state is deactivated', (done)->
        deactivatingstate = new class extends State
          statename: 'deactivatingstate'
          onDeactivate: sinon.spy()
        deactivatingstateA = new class extends State
          statename: 'a'
          parent: deactivatingstate
          onDeactivate: sinon.spy()
        deactivatingstateA.activate()
        .then ->
          deactivatingstate.deactivate()
          expect(deactivatingstate.isActive).not.to.be.true
          expect(deactivatingstateA.isActive).not.to.be.true
          expect(deactivatingstateA.onDeactivate.called).to.be.true
          done()
        , (reason)->
          fail(reason)
          done()
