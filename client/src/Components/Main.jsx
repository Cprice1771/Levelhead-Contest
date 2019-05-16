import React, { Component } from 'react';
import { Route, Redirect  } from 'react-router';
import Contest from './Contest';
import SubmissionList from './SubmissionList';
import DiscordLogin from './DiscordLogin';
import LoginLanding from './LoginLanding';
import {NotificationContainer} from 'react-notifications';
class Main extends Component {

    render() {
        return (
            <div className='container'>
                <div className="nav">

                </div>
                <DiscordLogin />
                <div className="header">
                    <div className="header-text">
                        <h1>LEVELCUP</h1>
                        <h3>Community Levelhead Contests</h3>
                    </div>
                    <div className="header-nav">
                        <button>Sign in <i class="fab fa-discord fa-lg"></i></button>
                    </div>
                </div>
                <div className="content-body">
                    <Route exact path="/" render={() => (<Redirect to="/contest/5ccb38a9a60c5628346eb1e3"/>)}/>
                    <Route path='/contest/:contestId' component={Contest} />
                    <Route path='/submissions/:contestId' component={SubmissionList} />
                    <Route path='/login' component={LoginLanding} />



                </div>
                <div className="footer">
                    This site and contest are not created by or endorsed by Butterscotch Shenanigans.  This project solely exists for the benefit of the community and fans of Levelhead.
                    <br/>
                    For support requests, please email <b>levelheaders@gmail.com</b>
                </div>

                <NotificationContainer />
            </div>
        );
    }
}

export default Main;