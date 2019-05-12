import { endPoints} from '../Constants/Endpoints';
import { EventEmitter } from 'events'
import axios from 'axios'

var _state = {
    loggedInUser: null
}

class UserStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    setLoggedInUser(user) {
        _state.loggedInUser = user;
        this.emitChange();
    }

    logout() {
        _state.loggedInUser = null;
        localStorage.removeItem('discord-token');
        this.emitChange();
    }

    getLoggedInUser() {
        return _state.loggedInUser;
    }

    emitChange(data) {
        this.emitter.emit('UserStoreChange', data)
    }

    addChangeListener(callback) {
        this.emitter.on('UserStoreChange', callback)
    }

    removeChangeListener( callback ) {
        this.emitter.removeListener('UserStoreChange', callback)
    }
}


const UserStore = new UserStoreClass();
export default UserStore;