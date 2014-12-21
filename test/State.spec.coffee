define [
  'State'
  'es6-promise'
], (State, es6promise)->
#  window.Promise = es6promise.Promise
  es6promise.polyfill()
  chai.config.includeStack = true;

  defer = ()->
    result = {}
    result.promise = new Promise (resolve, reject)->
      result.resolve = resolve
      result.reject = reject
    return result

  async = (cb)->
    setTimeout cb, 0

  describe 'State', ->
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
    bastate = new class extends State
      statename: 'a'
      route: ':foo'
      parent: bstate
    bbstate = new class extends State
      statename: 'b'
      route: 'b'
      parent: bstate
    bcstate = new class extends State
      statename: 'c'
      parent: bstate
    bcastate = new class extends State
      statename: 'a'
      route: 'a'
      parent: bcstate

    describe 'name generation', ->
      it 'should result in the correct name for state "a"', ->
        expect(astate.generateName()).to.equal 'a'
      it 'should result in the correct name for state "a.b"', ->
        expect(abstate.generateName()).to.equal 'a.b'
      it 'should result in the correct name for state "a.b.c"', ->
        expect(abcstate.generateName()).to.equal 'a.b.c'
      it 'should result in the correct name for state "b"', ->
        expect(bstate.generateName()).to.equal 'b'
      it 'should result in the correct name for state "b.a"', ->
        expect(bastate.generateName()).to.equal 'b.a'
      it 'should result in the correct name for state "b.b"', ->
        expect(bbstate.generateName()).to.equal 'b.b'

    describe 'route generation', ->
      it 'should result in the correct route for state "a"', ->
        expect(astate.generateRouteString()).to.equal 'a'
      it 'should result in the correct route for state "a.b"', ->
        expect(abstate.generateRouteString()).to.equal 'a/b'
      it 'should result in the correct route for state "a.b.c"', ->
        expect(abcstate.generateRouteString()).to.equal 'a/b/c'
      it 'should result in the correct route for state "b"', ->
        expect(bstate.generateRouteString()).to.equal 'b'
      it 'should result in the correct route for state "b.a"', ->
        expect(bastate.generateRouteString()).to.equal 'b/:foo'
      it 'should result in the correct route for state "b.b"', ->
        expect(bbstate.generateRouteString()).to.equal 'b/b'

      it 'should result in the correct templating of the route for bastate', ->
        expect(bastate.generateRoute foo: 'abc').to.equal 'b/abc'

      it 'should not generate repeating slashes, even if one state does not have a route', ->
        expect(bcastate.generateRouteString()).not.to.match(/\/\//)

    describe 'promise handling', ->
      it 'should resolve the states promises beforehand', (done)->
        deferred1 = defer()

        promiseTestState = new class extends State
          resolve:
            promise1: ->
              deferred1.promise

        expect(promiseTestState.isActive).not.to.be.true

        promiseTestState.activate()

        expect(promiseTestState.isActive).not.to.be.true

        deferred1.resolve()

        setTimeout ->
          expect(promiseTestState.isActive).to.be.true
          done()
        , 0

    describe 'deactivating states', ->
      it 'should deactivate all substates, when being deactivated', (done)->
        abcstate.activate()
        async ->
          expect(astate.isActive).to.be.true
          expect(abstate.isActive).to.be.true
          expect(abcstate.isActive).to.be.true
          astate.deactivate()
          expect(astate.isActive).to.be.false
          expect(abstate.isActive).to.be.false
          expect(abcstate.isActive).to.be.false
          done()

      it 'should call the on deactivate function, when a state is deactivated', ->
        astate.onDeactivate = sinon.spy()
        abcstate.onDeactivate = sinon.spy()
        abcstate.activate()

        async ->
          astate.deactivate()
          expect(astate.isActive).not.to.be.true
          expect(astate.onDeactivate.called).to.be.true
          expect(abcstate.isActive).not.to.be.true
