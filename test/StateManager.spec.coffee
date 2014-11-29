define [
  'dist/StateManager'
  'dist/State'
], (StateManager, State)->
  describe 'StateManager', ->
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

    describe 'registering States', ->
      it 'should be able to return states', ->
        expect(StateManager.getState 'a').toEqual astate
        expect(StateManager.getState 'a.b').toEqual abstate
        expect(StateManager.getState 'a.b.c').toEqual abcstate