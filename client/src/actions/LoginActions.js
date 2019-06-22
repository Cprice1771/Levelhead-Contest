import { NotificationManager} from 'react-notifications';
import { endPoints} from '../Constants/Endpoints';
import axios from 'axios'
import UserStore from '../Stores/UserStore';

let timer = null;

export default {
    login: async function() {
        try {
            if(!localStorage.getItem('discord-token')) {
                throw 'No token found'
            }
            var x = await axios.post(endPoints.LOGIN, JSON.parse(localStorage.getItem('discord-token')));
            UserStore.setLoggedInUser(x.data.user);
            
        } catch(err) {
            localStorage.removeItem('discord-token');
            NotificationManager.error('Failed to login, please try again');
        }
    },
    logout: function() {
        UserStore.logout();
    },
    initiateLogin: function() {
        if(!!timer) {
            return;
        }
        axios.post(endPoints.GET_DISCORD_LOGIN_LINK, { 
            redirect: `${window.location.origin}/login`,
         }).then(res => {
            let childWindow = window.open(res.data.link, '_blank', 'width=600 height=800');
            timer = setInterval(() => {
                if (childWindow.closed) {
                    clearInterval(timer);
                    timer = null;
                    if(!localStorage.getItem('discord-token')) {
                        NotificationManager.error('Failed to login, please try again');
                        return;
                    }
                    this.login();
                }
            }, 500);
        })
    },
    
}