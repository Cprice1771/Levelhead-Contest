import React, { Component } from 'react';
import * as moment from 'moment';
import { NavLink } from 'react-router-dom';
import UserStore from '../../Stores/UserStore';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';

class Contest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contest: null,
            currDate : moment(),
            timer: null,
            showModal: false,
            loggedIn: !!UserStore.getLoggedInUser()
        };

        this.formatTime = this.formatTime.bind(this);
        this.updateTimeLeft = this.updateTimeLeft.bind(this); 
        this.intervalHandle = null;

        this.loadSeason = this.loadSeason.bind(this);
        this.userChange = this.userChange.bind(this);
    }


    componentDidMount() {
        this.setState({loggedIn: UserStore.getLoggedInUser()});
        UserStore.addChangeListener(this.userChange);
        this.loadSeason(this.props.match.params.seasonId);

        this.intervalHandle = setInterval(this.updateTimeLeft, 1000);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userChange);
    }

    loadSeason(id) {
        axios.get(endPoints.GET_SEASON(id))
        .then( response => {
            this.setState({ season: response.data.data }, () => {
                this.updateTimeLeft();
            });
        });
    }

    userChange() {
        this.setState({loggedIn: UserStore.getLoggedInUser()});
    }

    formatTime(num) {
        return ('0' + num).substr(-2);
    }

    updateTimeLeft() {
        if(!this.state.season) {
            return;
        }

        let currDate = moment();
        let endDate = moment(this.state.season.endDate);
        let days = endDate.diff(currDate, 'days');
        currDate = currDate.add(days, 'days');

        let hours = endDate.diff(currDate, 'hours');
        currDate = currDate.add(hours, 'hours');

        let minutes = endDate.diff(currDate, 'minutes');
        currDate = currDate.add(minutes, 'minutes');

        let seconds = endDate.diff(currDate, 'seconds');

        this.setState({
            days, hours, minutes, seconds
        });
    }

    render() {
        if(!this.state.season) {
            return <div>Loading...</div>
        }

        let seasonStarted =  moment(this.state.season.startDate) < moment();
        let seasonNotOver = moment(this.state.season.endDate) > moment();
 
        return <div className="card"> 
            <div className="card-header-season">
                <div className="card-text">
                    <h2>{this.state.season.name}</h2>
                    <h3> {moment(this.state.season.startDate).format('MMM Do')} - {moment(this.state.season.endDate).format('MMM Do')}</h3>
                </div>
            </div>

                <div className="card-body">
                    <NavLink exact to={`/season/${this.props.match.params.seasonId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                        <button className='b2' >View Leaderboard</button>
                    </NavLink> 
                </div>

            { seasonNotOver && seasonStarted &&

            <div className="clock-container"> 
                <h1>Time Remaining in Season</h1>
                <div className='row justify-content-center'>
                    <div className="timeBox"><h4 className='timeTitle'>Days</h4> <span>{this.formatTime(this.state.days)} </span> </div>
                    <div className="timeBox"><h4 className='timeTitle'>Hours</h4>  <span>{this.formatTime(this.state.hours)} </span></div> 
                    <div className="timeBox"><h4 className='timeTitle'>Minutes</h4>  <span>{this.formatTime(this.state.minutes)} </span></div> 
                    <div className="timeBox"><h4 className='timeTitle'>Seconds</h4>  <span>{this.formatTime(this.state.seconds)}</span></div>
                </div>
            </div>
            }

             <div className="card-rules">
                <h1 align='center'>Season Info</h1>
     
                <div>
                    <ul>
                        <li>To enroll in the season, login using discord and then click enroll on the Leaderboard page. You will be prompted to enter your rumpus lookup code (<a href="https://www.bscotch.net/account" target="blank">found here</a>) to link your levelcup account to your rumpus account.</li>
                        <li>New players will be entered into the Jem league, and will have a chance to progress to higher leagues by performing well.</li>
                        <li>Every week day during the season a new level will be posted with Diamond, Gold, Silver and Bronze times.</li>
                        <li>Once enrolled, play any of the levels posted and your times will automatically be scored every hour.</li>
                        <li>Scoring works as follows</li>
                        <ul>
                            <li>Diamond: 5 points</li>
                            <li>Gold: 3 points</li>
                            <li>Silver: 2 points</li>
                            <li>Bronze: 1 point</li>
                        </ul>
                    </ul>
                </div>
                
                </div>

        </div>;
    }

}

export default Contest;