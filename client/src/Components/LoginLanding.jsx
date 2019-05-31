import React, { Component } from 'react';

class LoginLanding extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.generateRandomString = this.generateRandomString.bind(this);
    }

    componentDidMount(){

        const fragment = new URLSearchParams(window.location.hash.slice(1));
        if (fragment.has("access_token")) {
            const accessToken = fragment.get("access_token");
            const tokenType = fragment.get("token_type");

            localStorage.setItem('discord-token', JSON.stringify({ accessToken, tokenType }));
            window.close();
        }
    }

    generateRandomString() {
        const rand = Math.floor(Math.random() * 10);
        let randStr = '';
    
        for (let i = 0; i < 20 + rand; i++) {
            randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
    
        return randStr;
    }


    render() {
       

        return <div>Logging you in...</div>
    }
}

export default LoginLanding;