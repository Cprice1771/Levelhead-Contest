import React, { Component } from 'react';

import { endPoints} from '../Constants/Endpoints';
import axios from 'axios'
import discordLogo from '../assets/Discord-Logo-White.png';
import discordLogoText from '../assets/Discord-Logo_Wordmark-White.png';

class DiscordLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.login = this.login.bind(this);
        this.generateRandomString = this.generateRandomString.bind(this);
    }

    generateRandomString() {
        const rand = Math.floor(Math.random() * 10);
        let randStr = '';
    
        for (let i = 0; i < 20 + rand; i++) {
            randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
    
        return randStr;
    }

    login() {
        axios.get(endPoints.GET_DISCORD_LOGIN_LINK).then(res => {
            window.location.href = res.data.link;
        })
    }


    render() {
        return (
            <div className='discord-login' onClick={this.login}>
                <img src={discordLogoText} width='auto' height='25'/>
            </div>
        );
    }
}

export default DiscordLogin;