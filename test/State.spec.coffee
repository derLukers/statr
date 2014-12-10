define [
  'State'
], (State)->
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
        expect(bastate.generateRoute foo: 'foo').to.equal 'b/foo'

      it 'should not generate repeating slashes, even if one state does not have a route', ->
        expect(bcastate.generateRouteString()).not.to.match(/\/\//)