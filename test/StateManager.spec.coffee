define [
  'StateManager'
  'State'
  'es6-promise'
], (StateManager, State, es6promise)->
  window.Promise = es6promise.Promise
  chai.config.includeStack = true

  describe 'StateManager', ->
    astate = null
    abstate = null
    abcstate = null
    bstate = null
    bastate = null
    bbstate = null
    cstate = null

    beforeEach ->
      StateManager.router =
        navigate: sinon.spy()
        route: sinon.spy()
      StateManager.clear()
      astate = new class extends State
        statename: 'a'
        route: 'a'
      abstate = new class extends State
        statename: 'b'
        route: 'b'
        parent: astate
      abcstate = new class extends State
        statename: 'c'
        route: 'c'
        parent: abstate
      bstate = new class extends State
        statename: 'b'
        route: 'b'
        abstract: true
      bastate = new class extends State
        statename: 'a'
        route: ':foo'
        parent: bstate
      bbstate = new class extends State
        statename: 'b'
        route: 'b'
        parent: bstate
      cstate = new class extends State
        statename: 'c'
        route: ''

    describe 'registering states', ->
      it 'should be able to return states', ->
        expect(StateManager.getState 'a').to.equal astate
        expect(StateManager.getState 'a.b').to.equal abstate
        expect(StateManager.getState 'a.b.c').to.equal abcstate

      it 'should register the routes correctly', ->
        expect(StateManager.router.route.getCall(0).args[0]).to.equal 'a'
        expect(StateManager.router.route.getCall(1).args[0]).to.equal 'a/b'
        expect(StateManager.router.route.getCall(2).args[0]).to.equal 'a/b/c'
        expect(StateManager.router.route.getCall(5).args[0]).to.equal ''

      it 'should not register routes for abstract states', ->
        for call in StateManager.router.route.getCalls()
          expect(call.args[0]).not.to.equal bstate.generateRouteString()

      it 'must not be able to register states with the same name', ->
        expect(-> StateManager.registerState generateName: sinon.stub().returns 'a').to.throw 'State with name "a" already exists.'

    describe 'navigating to states', ->
      it 'should activate the correct state on the go function', ()->
        StateManager.go bbstate.generateName()
        .then ->
          expect(bbstate.isActive).to.be.true
          expect(bstate.isActive).to.be.true
          expect(bastate.isActive).to.be.false

      it 'should deactivate states, when switching between them', ()->
        StateManager.go bbstate.generateName()
        .then ->
          expect(bbstate.isActive).to.be.true
          expect(bstate.isActive).to.be.true
          expect(bastate.isActive).to.be.false
          return StateManager.go bastate.generateName()
        .then ->
          expect(bastate.isActive).to.be.true
          expect(bstate.isActive).to.be.true
          expect(bbstate.isActive).to.be.false

      it 'should route the browser to the correct url if the route navigate', ()->
        StateManager.go bbstate.generateName(), null, {navigate: false}
        .then ->
          expect(StateManager.router.navigate.called).to.be.false
          return StateManager.go bastate.generateName(), foo: 'foo'
        .then ->
          expect(StateManager.router.navigate.called).to.be.true
          expect(StateManager.router.navigate.firstCall.args[0]).to.equal 'b/foo'

    describe 'clearing states', ->
      it 'must deactivate the current active chain of states', ->
        StateManager.go bbstate.generateName()
        StateManager.clear()
        expect(bbstate.isActive).to.be.false
        expect(bstate.isActive).to.be.false

