import React, { Component } from 'react';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';
import AddLevelModal from './AddLevelModal';
import { NotificationManager } from 'react-notifications';
import UserStore from '../../Stores/UserStore';
import Leaderboard from './Leaderboard';
import * as moment from 'moment';
import LoginActions from '../../actions/LoginActions';
import LevelBoard from './LevelBoard';
import EnrollModal from './EnrollModal';
import * as _ from 'lodash';


class SeasonLeaderboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            season: null,
            showEnrollModal: false,
        }

        this.loadSeason = this.loadSeason.bind(this);
        this.userChange = this.userChange.bind(this);
        this.enroll = this.enroll.bind(this);
        this.addLevel = this.addLevel.bind(this);
    }

    componentDidMount() {
        UserStore.addChangeListener(this.userChange);
        this.loadSeason(this.props.match.params.seasonId);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userChange);
    }

    loadSeason(id) {
        axios.get(endPoints.GET_SEASON(id))
        .then( response => {
            this.setState({ season: response.data.data });
        });
    }

    userChange() {
        this.setState({loggedIn: UserStore.getLoggedInUser()});
    }

    async addLevel(level) {
        try {
            await axios.post(endPoints.ADD_LEVEL, {
                addedBy : this.state.loggedIn._id,
                seasonId : this.state.season._id,
                lookupCode: level.lookupCode,
                diamondValue: level.diamondValue,
                goldValue: level.goldValue,
                silverValue: level.silverValue,
                bronzeValue: level.bronzeValue,
                startDate: level.startDate
            });

            NotificationManager.success('Level Added');
            this.loadSeason(this.props.match.params.seasonId);
        } catch(err) {
            NotificationManager.error(`Error addning level: ${err}`);
        }
        this.setState({ showAddLevelModal : false});
    }

    async enroll(rumpusId) {
        if(!rumpusId && !this.state.loggedIn.rumpusId) {
            this.setState({ showEnrollModal: true });
            return;
        }

        try {
            await axios.post(endPoints.ENROLL, {
                userId : this.state.loggedIn._id,
                seasonId : this.state.season._id,
                rumpusId: rumpusId
            });
            this.loadSeason(this.props.match.params.seasonId);
            NotificationManager.success('You have been enrolled in this season');
        } catch(err) {
            NotificationManager.error(`Error enrolling ${err.response.data.msg}`);
        }
    }

    render(){
        if(!this.state.season) {
            return <div>Loading...</div>
        }
        
        let userId = !!this.state.loggedIn ? this.state.loggedIn._id : null;
        let inSeason = !!this.state.season.entries.find(x => x.userId === userId);

        return <div className="card">
            <div className="card-header-season">
                <div className="card-text">
                    <h2>{this.state.season.name}</h2>
                    <h3> {moment(this.state.season.startDate).format('MMM Do')} - {moment(this.state.season.endDate).format('MMM Do')}</h3>
                </div>
            </div>
            <div className="card-body">
            
            { this.state.loggedIn && !inSeason && <button className='b1' onClick={this.enroll}>Enroll</button> }
            { !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Enroll</button> }
            
            </div>
            <div className="card-rules pad-bottom">
                <LevelBoard
                    levels={this.state.season.levelsInSeason}
                    addLevel={()=> { this.setState({ showAddLevelModal : true })}}
                />
                <Leaderboard
                    entries={this.state.season.entries}
                    lastUpdate={_.max(this.state.season.levelsInSeason.map(x => x.lastUpdatedScores))}
                    userId={userId}
                />
                
            </div>

            <EnrollModal 
                showModal={this.state.showEnrollModal}
                handleCloseModal={() => { this.setState({ showEnrollModal: false }) }}
                enroll={this.enroll}
            />

            <AddLevelModal 
                showModal={this.state.showAddLevelModal}
                handleCloseModal={() => { this.setState({ showAddLevelModal: false }) }}
                addLevel={this.addLevel}
            />
        </div>
    }
}

export default SeasonLeaderboard;