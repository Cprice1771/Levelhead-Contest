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

    getUser(discordId) {
        axios.get(endPoints.GET_USER(discordId))
        .then( response => {
            _state.loggedInUser = response.data;
            this.emitChange(response.data);
        }).catch(err => {
            Console.log(err);
        })
    }

    logout() {
        _state.loggedInUser = null;
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