import { EventEmitter } from 'events'

var _state = {
    local : {
        api             : 'http://localhost:3000',
    },
    production : {
        api             : 'http://localhost:3000',
    },
    
};

class ConfigStoreClass {

    constructor() {
        this.emitter = new EventEmitter();        
    }

    getUrl() {
        var href = window.location.href.toLowerCase();

        if (href.indexOf('localhost') !== -1) {
            return _state.local.api;
        }
        
        return _state.production.api;
    }

    

    dispatchToken;
}


const ConfigStore = new ConfigStoreClass();
export default ConfigStore;