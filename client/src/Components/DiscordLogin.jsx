import React, { Component } from 'react';
import { NotificationManager} from 'react-notifications';
import { endPoints} from '../Constants/Endpoints';
import axios from 'axios'
import UserStore from '../Stores/UserStore';

import LoginActions from '../actions/LoginActions';

class DiscordLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedInUser: UserStore.getLoggedInUser()
        };
        this.initiateLogin = this.initiateLogin.bind(this);
        this.logout = this.logout.bind(this);
        this.userStoreChange = this.userStoreChange.bind(this);
    }

    

    componentDidMount() {
        UserStore.addChangeListener(this.userStoreChange);
        if(!!localStorage.getItem('discord-token')) {
            LoginActions.login();
        }
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userStoreChange);
    }

    userStoreChange() {
        this.setState({ loggedInUser: UserStore.getLoggedInUser() })
    }

    logout() {
        LoginActions.logout();
    }

    initiateLogin() {
       LoginActions.initiateLogin();
    }


    render() {

        var loggedIn = !!this.state.loggedInUser;

        let content = null;
        if(loggedIn) {
            content = <button onClick={this.logout}>Logout</button>;
        } else {
            content =  <button onClick={this.initiateLogin}>Sign in <i className="fab fa-discord fa-lg"></i></button>;
        }


        return (
            <div>
                {content}
            </div>
        );
    }
}

export default DiscordLogin;