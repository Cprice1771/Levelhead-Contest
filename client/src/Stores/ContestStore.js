import { endPoints} from '../Constants/Endpoints';
import { EventEmitter } from 'events'
import ConfigStore from './ConfigStore';
import axios from 'axios'

var _state = {
    contests: [],
    selectedContest: null,
}

class ContestStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    getContests() {
        axios.get(endPoints.GET_CONTEST('5ccb38a9a60c5628346eb1e3'))
        .then( response => {
            _state.contests = [response.data];
            _state.selectedContest = response.data;
            this.emitChange(_state);
        });
    }

    getSelectedContest() {
        return _state.selectedContest;
    }

    contests() {
        return _state.contests;
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