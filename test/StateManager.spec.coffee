define [
  'StateManager'
  'State'
  'es6-promise'
], (StateManager, State, es6promise)->
  window.Promise = es6promise.Promise
  es6promise.polyfill()

  describe 'StateManager', ->

    beforeEach ->
      StateManager.clear()

    describe 'registering states', ->
      it 'should be able to return states', ->
        astate = new class extends State
          statename: 'a'
        abstate = new class extends State
          statename: 'b'
          parent: astate
        abcstate = new class extends State
          statename: 'c'
          parent: abstate
        expect(StateManager.getState 'a').to.equal astate
        expect(StateManager.getState 'a.b').to.equal abstate
        expect(StateManager.getState 'a.b.c').to.equal abcstate

      it 'must not be able to register states with the same name', ->
        StateManager.registerState generateName: sinon.stub().returns 'a'
        expect(-> StateManager.registerState generateName: sinon.stub().returns 'a').to.throw 'State with name "a" already exists.'

    describe 'navigating to states', ->
      it 'should activate the correct state on the go function', (done)->
        correctState = new class extends State
          statename: 'correctState'
        correctStateA = new class extends State
          statename: 'a'
          parent: correctState
        StateManager.go correctStateA.generateName()
        .then ->
          expect(correctState.isActive).to.be.true
          expect(correctStateA.isActive).to.be.true
          done()

      it 'should deactivate states, when switching between them', (done)->
        switchingState = new class extends State
          statename: 'switchingState'
        switchingStateA = new class extends State
          statename: 'a'
          parent: switchingState
        switchingStateB = new class extends State
          statename: 'b'
          parent: switchingState
        StateManager.go(switchingStateA.generateName()).then ->
          expect(switchingStateA.isActive).to.be.true
          expect(switchingState.isActive).to.be.true
          expect(switchingStateB.isActive).to.be.false
          StateManager.go(switchingStateB.generateName()).then ->
            expect(switchingStateB.isActive).to.be.true
            expect(switchingState.isActive).to.be.true
            expect(switchingStateA.isActive).to.be.false
            done()

    describe 'clearing states', ->
      it 'must deactivate the current active chain of states', (done)->
        clearingstate = new class extends State
          statename: 'clearingstate'
        clearingstateA = new class extends State
          statename: 'a'
          parent: clearingstate
        StateManager.go clearingstateA.generateName()
        .then ->
          StateManager.clear()
          expect(clearingstateA.isActive).to.be.false
          expect(clearingstate.isActive).to.be.false
          done()

      it 'should throw an Error when trying to go to a non existant state', ->
        expect(StateManager.go.bind(StateManager, 'nonexistantstate')).to.throw('No State with name "nonexistantstate" found.')

