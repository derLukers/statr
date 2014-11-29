define [
  'dist/StateManager'
  'dist/State'
], (StateManager, State)->
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

    describe 'name generation', ->
      it 'should result in the correct name for state "a"', ->
        expect(astate.generateName()).toEqual 'a'
      it 'should result in the correct name for state "a.b"', ->
        expect(abstate.generateName()).toEqual 'a.b'
      it 'should result in the correct name for state "a.b.c"', ->
        expect(abcstate.generateName()).toEqual 'a.b.c'
      it 'should result in the correct name for state "b"', ->
        expect(bstate.generateName()).toEqual 'b'
      it 'should result in the correct name for state "b.a"', ->
        expect(bastate.generateName()).toEqual 'b.a'
      it 'should result in the correct name for state "b.b"', ->
        expect(bbstate.generateName()).toEqual 'b.b'

    describe 'route generation', ->
      it 'should result in the correct route for state "a"', ->
        expect(astate.generateRouteString()).toEqual '/a'
      it 'should result in the correct route for state "a.b"', ->
        expect(abstate.generateRouteString()).toEqual '/a/b'
      it 'should result in the correct route for state "a.b.c"', ->
        expect(abcstate.generateRouteString()).toEqual '/a/b/c'
      it 'should result in the correct route for state "b"', ->
        expect(bstate.generateRouteString()).toEqual '/b'
      it 'should result in the correct route for state "b.a"', ->
        expect(bastate.generateRouteString()).toEqual '/b/:foo'
      it 'should result in the correct route for state "b.b"', ->
        expect(bbstate.generateRouteString()).toEqual '/b/b'

      it 'should result in the correct templating of the route for bastate', ->
        expect(bastate.generateRoute(foo: 'foo')).toEqual('/b/foo')