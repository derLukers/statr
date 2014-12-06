# State

The [Angular ui.router Team describes]() states as:
>  ... a "place" in the application in terms of the overall UI and navigation

States are organized in trees, which reduces the amount of code, and helps managing routes, names and dependencies of the states.
We will work on an organizer example, which has the following tree of states. When referring to the states, their full name will in most cases be abbreviated to the last part.

```
    o   organizer   (full name is "organizer")
   / \
  |  o    calendar  (full name is "organizer.calendar")
  |
  o       contacts  (full name is "organizer.contacts")
 / \
o  |      detail    (full name is "organizer.contacts.detail")
   |
   o      edit      (full name is "organizer.contacts.edit")
```
When a state is activated, its parent states are sequentially resolved and activated from the top.
This enables using entities, which were resolved by parent states, inside the current states resolve.
For example, upon login, the organizer state is activated and resolves the current users details from the server via the url `/api/currentuser`. When the contacts state is now
activated, it wants to have the id of the current user, so it can call `/api/user/<id>/contacts`. Therefore the contacts state uses the resolved values of the organizer state to.
This approach however, comes with a performance trade off, when having slow resolves, which would then be executed sequentially.

## Creating States
States can be created in the following way:
```coffeescript
organizer = new class extends State
    route: ''
    statename: 'organizer'
    resolve:
        user: ->
            fetchCurrentUser()
    onActivate: (parameters, resolveResults)->
        ... show organizer view for user ...

contacts = new class extends State
    route: 'contacts'
    statename: 'contacts'
    parent: organizer
    resolve:
        contacts:
            fetchContactsForUser(resolveResults['user'])
    onActivate: (parameters, resolveResults)->
        ... show contacts view for user ...

editcontact = new class extends State
    route: ':contactid/edit'
    statename: 'edit'
    parent: organizer
    resolve:
        contact: (parameters, resolveResults)->
            fetchContact(parameters['contactid'])
    onActivate: (parameters, resolveResults)->
        ... show contacts edit for user ...
```

The states are then automatically registered with the statemanager.

## Switching between states
Switching and routing from one state to another can be easily done using the statemanagers `routeTo` function.
```coffeescript
Statemanager.go 'organizer.contacts.edit', {'contactid': '123'}
```
This resolves the `organizer.contacts.edit` state and changes the route to `/contacts/123/edit`.
Switching states always goes the shortest activation path. This means, that the activation path traverses to the first mutual parent state, which does does not need reactivation
due to parameters being changed. For example: when switching from the edit to the detail state, only the detail state gets activated and the edit state gets deactivated. When
switching from the detail state to the calendar state however, all states up until the organizer state get deactivated and the calendar state gets activated.

## Getting the full name and route of the state
```coffeescript
editcontact.getFullName()   # returns 'organizer.contact.edit'
editcontact.getRouteString()    # returns '/contacts/:contactid/edit'
editcontact.getRoute contactid: 123 # returns '/contacts/123/edit'
```