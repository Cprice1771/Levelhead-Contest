import { endPoints} from '../Constants/Endpoints';
import { EventEmitter } from 'events'
import axios from 'axios'

var _state = {
    selectedContest: null,
}

class ContestStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    getContest(id) {
        axios.get(endPoints.GET_CONTEST(id))
        .then( response => {
            _state.selectedContest = response.data;
            this.emitChange(_state);
        });
    }

    getSelectedContest() {
        return _state.selectedContest;
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