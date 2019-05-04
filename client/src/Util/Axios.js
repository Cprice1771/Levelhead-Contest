import axios from 'axios'
import ConfigStore from '../Stores/ConfigStore';

axios.defaults.baseURL = ConfigStore.getUrl();