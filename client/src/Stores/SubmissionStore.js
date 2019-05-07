import { endPoints} from '../Constants/Endpoints';
import { EventEmitter } from 'events'
import ConfigStore from './ConfigStore';
import axios from 'axios'

var _state = {
    submissions: []
}

class SubmissionStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    loadSubmissionsForContest(contestId) {
        axios.get(endPoints.GET_SUMISSIONS_FOR_CONTEST(contestId))
        .then( response => {
            _state.submissions = response.data;
            this.emitChange(response.data);
        })
    }

    getSubmissions() {
        return _state.submissions;
    }

    emitChange(data) {
        this.emitter.emit('SubmissionStoreChange', data)
    }

    addChangeListener(callback) {
        this.emitter.on('SubmissionStoreChange', callback)
    }

    removeChangeListener( callback ) {
        this.emitter.removeListener('SubmissionStoreChange', callback)
    }
}


const SubmissionStore = new SubmissionStoreClass();
export default SubmissionStore;