import axios from 'axios'
import ConfigStore from '../Stores/ConfigStore';

axios.defaults.proxy = {
    host: "localhost",
    port: "3000"
};
axios.defaults.baseURL = ConfigStore.getUrl();
debugger;
