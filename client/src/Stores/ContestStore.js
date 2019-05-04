import { endPoints} from '../Constants/Endpoints';
import { EventEmitter } from 'events'
import ConfigStore from './ConfigStore';
import axios from 'axios'

var _state = {
    contests: []
}

class ContestStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    getContests() {
        axios.get(endPoints.GET_ALL_CONTESTS)
        .then( response => {
            _state.submissions = response;
        })
    }

    getSubmissions() {
        return _state.contests;
    }

    emitChange(data) {
        this.emitter.emit('ContestStoreChange', data)
    }

    addChangeListener(callback) {
        this.emitter.on('ContestStoreChange', callback)
    }

    removeChangeListener( callback ) {
        this.emitter.removeListener('ContestStoreChange', callback)
    }
}


const ContestStore = new ContestStoreClass();
export default ContestStore;