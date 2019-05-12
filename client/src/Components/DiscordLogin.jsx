import React, { Component } from 'react';
import { NotificationManager} from 'react-notifications';
import { endPoints} from '../Constants/Endpoints';
import axios from 'axios'
import discordLogo from '../assets/Discord-Logo-White.png';
import discordLogoText from '../assets/Discord-Logo_Wordmark-White.png';
import UserStore from '../Stores/UserStore';

class DiscordLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedInUser: UserStore.getLoggedInUser()
        };
        this.login = this.login.bind(this);
        this.initiateLogin = this.initiateLogin.bind(this);
        this.generateRandomString = this.generateRandomString.bind(this);
        this.logout = this.logout.bind(this);
    }

    generateRandomString() {
        const rand = Math.floor(Math.random() * 10);
        let randStr = '';
    
        for (let i = 0; i < 20 + rand; i++) {
            randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
    
        return randStr;
    }

    componentDidMount() {
        if(!!localStorage.getItem('discord-token')) {
            this.login();
        }
    }

    async login() {
        try {
            var x = await axios.post(endPoints.LOGIN, JSON.parse(localStorage.getItem('discord-token')))
            UserStore.setLoggedInUser(x.data.user)
            this.setState({ loggedInUser: x.data.user });
            
        } catch(err) {
            localStorage.removeItem('discord-token');
            NotificationManager.error('Failed to login, please try again');
        }
    }

    logout() {
        UserStore.logout();
        this.setState({
            loggedInUser: null
        })
    }

    initiateLogin() {
        if(!!this.state.timer) {
            return;
        }


        axios.post(endPoints.GET_DISCORD_LOGIN_LINK, { 
            redirect: `${window.location.origin}/login`,
         }).then(res => {
            let childWindow = window.open(res.data.link, '_blank', 'width=600 height=800');
            
            var timer = setInterval(() => {
                if (childWindow.closed) {
                    clearInterval(this.state.timer);
                    this.setState({ timer: null });
                    if(!localStorage.getItem('discord-token')) {
                        NotificationManager.error('Failed to login, please try again');
                        return;
                    }

                    this.login();
                }
            }, 500);

            this.setState({ timer: timer });
        })
    }


    render() {

        var loggedIn = !!this.state.loggedInUser;

        return (
            <div className='discord-login' onClick={!loggedIn ? this.initiateLogin : () => {}}>
                { loggedIn ? this.state.loggedInUser.discordDisplayName :  <img src={discordLogoText} width='auto' height='25'/> }
                { loggedIn && <button className='btn btn-secondary' onClick={this.logout}>Logout</button>}
            </div>
        );
    }
}

export default DiscordLogin;