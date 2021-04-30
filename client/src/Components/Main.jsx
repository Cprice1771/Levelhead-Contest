import React, { Component } from 'react';
import { Route  } from 'react-router';
import DiscordLogin from './DiscordLogin';
import LoginLanding from './LoginLanding';
import {NotificationContainer} from 'react-notifications';
import UserProfile from './Profile/UserProfile';
import { NavLink } from 'react-router-dom';
import EventList from './EventList';
//Season
import CreateSeason from './Season/CreateSeason';
import SeasonLeaderboard from './Season/SeasonLeaderboard';
import SeasonInfo from './Season/SeasonInfo';
//Contest
import Contest from './Contest/Contest';
import SubmissionList from './Contest/SubmissionList';
import ContestCreator from './Contest/ContestCreator';
import RaceMain from './Race/RaceMain';
import Quiz from './Quiz/Quiz';

class Main extends Component {

    render() {
        return (
            <div className='container'>
                <div className="nav">

                </div>
                
                <div className="header">
                    <div className="header-text">
                    <NavLink exact to={`/`} ><h1>LEVELCUP</h1></NavLink>
                        <h3>Levelhead Community Events</h3>
                    </div>
                    <div className="header-nav">
                        <DiscordLogin />
                    </div>
                </div>
                <div className="content-body">
                    <Route exact path="/" component={EventList}/> 
                    
                    <Route path='/contest/:contestId' component={Contest} />
                    <Route path='/submissions/:contestId' component={SubmissionList} />
                    <Route path='/create-contest/' component={ContestCreator} />
                    <Route path='/login' component={LoginLanding} />
                    <Route path='/profile/:profileId' component={UserProfile} />
                    <Route path='/contests' component={EventList} />

                    <Route path='/create-season' component={CreateSeason} />
                    <Route path='/season/:seasonId' component={SeasonLeaderboard} />
                    <Route path='/seasonInfo/:seasonId' component={SeasonInfo} />
                    <Route path='/race' component={RaceMain} />
                    <Route path='/quiz' component={Quiz} />


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