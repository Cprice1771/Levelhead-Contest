import { NotificationManager} from 'react-notifications';
import Axios from 'axios';
class HttpClient {

    constructor() {

        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
    }

    async post(url, data) {
        try {
            var resp = await Axios.post(url, data);
            return resp.data;
        } catch (res) {
            if(res && res.response && res.response.data) {
                NotificationManager.error(res.response.data.msg);
                throw res.response.data.msg;
            }
            else {
                NotificationManager.error('Connection Error');
                throw 'Connection Error';
            }
        }
    }

    async get(url) {
        try {
            var resp = await Axios.get(url);
            return resp.data;
        } catch (res) {
            if(res && res.response && res.response.data) {
                NotificationManager.error(res.response.data.msg);
                throw res.response.data.msg;
            }
            else {
                NotificationManager.error('Connection Error');
                throw 'Connection Error';
            }
        }
    }
}
export default new HttpClient();