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
import RecommendLevelModal from './RecommendLevelModal';
import { NavLink } from 'react-router-dom';

const awards = [{
    awardName: 'Legend',
    awardIcon: '✳️',
},
{
    awardName: 'Nightmare',
    awardIcon: '☠️'
}];

class SeasonLeaderboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            season: null,
            showEnrollModal: false,
            toDelete: null,
        }

        this.loadSeason = this.loadSeason.bind(this);
        this.userChange = this.userChange.bind(this);
        this.enroll = this.enroll.bind(this);
        this.addLevel = this.addLevel.bind(this);
        this.setLeague = this.setLeague.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.bookmarkAll = this.bookmarkAll.bind(this);
    }

    componentDidMount() {
        this.setState({loggedIn: UserStore.getLoggedInUser()});
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

    async setLeague(player, newLeague) {
        try {
            let res = await axios.post(endPoints.SET_LEAGUE, {
                seasonId: this.props.match.params.seasonId,
                userId: player.userId,
                newLeague: newLeague
            });
            if(res.data.success) {
                NotificationManager.success(`${player.rumpusAlias} League Updated`);
            } else {
                NotificationManager.error('Something went wrong');
            }
            this.loadSeason(this.props.match.params.seasonId);
        } catch(err) {
            NotificationManager.error('Something went wrong');
        }
    }

    bookmarkAll() {
        this.bookmark(this.state.season.levelsInSeason.filter(x => new Date(x.startDate) < new Date()).map(x => x.lookupCode));
    }

    bookmark(lookupCodes) {
        axios.post(endPoints.BOOKMARK_SUBMISSION, {
            lookupCodes: lookupCodes,
            apiKey: UserStore.getLoggedInUser().apiKey,
        }).then(res => {
            if(res.data.success) {
                NotificationManager.success('Bookmarked');
            } else {
                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            if(res && res.response && res.response.data) {
                NotificationManager.error(res.response.data.msg);
            } else {
                NotificationManager.error('Something went wrong');
            }
            
        });
    }

    async addLevel(level) {
        try {
            if(this.state.selectedLevel) {
                await axios.post(endPoints.EDIT_LEVEL, {
                    addedBy : this.state.loggedIn._id,
                    seasonId : this.state.season._id,
                    lookupCode: level.lookupCode,
                    diamondValue: level.diamondValue,
                    platinumValue: level.platinumValue,
                    goldValue: level.goldValue,
                    silverValue: level.silverValue,
                    bronzeValue: level.bronzeValue,
                    startDate: level.startDate,
                    bonusAward: level.bonusAward
                });
            } else {
                await axios.post(endPoints.ADD_LEVEL, {
                    addedBy : this.state.loggedIn._id,
                    seasonId : this.state.season._id,
                    lookupCode: level.lookupCode,
                    diamondValue: level.diamondValue,
                    platinumValue: level.platinumValue,
                    goldValue: level.goldValue,
                    silverValue: level.silverValue,
                    bronzeValue: level.bronzeValue,
                    startDate: level.startDate,
                    bonusAward: level.bonusAward
                });
            }

            NotificationManager.success('Level Added');
            this.loadSeason(this.props.match.params.seasonId);
        } catch(err) {
            NotificationManager.error(`Error addning level: ${err}`);
        }
        this.setState({ showAddLevelModal : false, selectedLevel: null});
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

        let canBookmark = !!UserStore.getLoggedInUser() && UserStore.getLoggedInUser().apiKey;
        let seasonOver = new Date(this.state.season.endDate) < new Date();
        let userId = !!this.state.loggedIn ? this.state.loggedIn._id : null;
        let inSeason = !!this.state.season.entries.find(x => x.userId === userId);
        let admin = this.state.loggedIn && ['admin', 'season-moderator'].indexOf(this.state.loggedIn.role) >= 0;
        return <div className="card">
            <div className="card-header-season">
                <div className="card-text">
                    <h2>{this.state.season.name}</h2>
                    <h3> {moment(this.state.season.startDate).format('MMM Do')} - {moment(this.state.season.endDate).format('MMM Do')}</h3>
                </div>
            </div>
            <div className="card-body">
            
            { !seasonOver && this.state.loggedIn && !inSeason && <button className='b1' onClick={() => { this.enroll(null); }}>Enroll</button> }
            { !seasonOver && !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Enroll</button> }
            <NavLink exact to={`/seasonInfo/${this.props.match.params.seasonId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                        <button className='b2' >Season Info</button>
            </NavLink>
            
            </div>
            <div className="card-rules pad-bottom">
                <LevelBoard
                    seasonOver={seasonOver}
                    seasonId={this.state.season._id}
                    levels={this.state.season.levelsInSeason}
                    addLevel={()=> { this.setState({ showAddLevelModal : true })}}
                    admin={admin}
                    onEdit={(level)=>  { this.setState({ showAddLevelModal: true, selectedLevel:level })}}
                    onDelete={async (lvl) =>  { 
                        let toDel = prompt('Please enter the level code id of the leve you wish to delete');
                        if(lvl.lookupCode === toDel) {
                            let res = await axios.post(endPoints.DELETE_LEVEL, {...lvl, seasonId: this.props.match.params.seasonId});
                            if(res.data.success) {
                                NotificationManager.success(`Deleted ${lvl.lookupCode}`);
                            } else {
                                NotificationManager.error('Something went wrong');
                            }
                            this.loadSeason(this.props.match.params.seasonId);
                        } else {
                            NotificationManager.error('Level code entered did not match one selected for deletion');
                        }
                    }}
                    canBookmark={canBookmark}
                    bookmark={this.bookmark}
                    bookmarkAll={this.bookmarkAll}
                    showRecommend={()=> { this.setState({ showRecommendLevelModal : true })}}
                />
                <Leaderboard
                    seasonOver={seasonOver}
                    levelInfo={this.state.season.levelsInSeason}
                    seasonId={this.state.season._id}
                    entries={this.state.season.entries}
                    lastUpdate={_.max(this.state.season.entries.map(x => x.lastUpdatedScores))}
                    userId={userId}
                    admin={admin}
                    setLeague={this.setLeague}
                />
                
            </div>

            <EnrollModal 
                showModal={this.state.showEnrollModal}
                handleCloseModal={() => { this.setState({ showEnrollModal: false }) }}
                enroll={this.enroll}
            />

            {this.state.showAddLevelModal && 
            <AddLevelModal 
                awards={awards}
                editing={this.state.selectedLevel}
                showModal={this.state.showAddLevelModal}
                handleCloseModal={() => { this.setState({ showAddLevelModal: false }) }}
                addLevel={this.addLevel}
            />
            }

            {this.state.showRecommendLevelModal && 
                <RecommendLevelModal 
                    showModal
                    canBookmark={canBookmark}
                    bookmark={this.bookmark}
                    bookmarkAll={this.bookmarkAll}
                    handleCloseModal={() => { this.setState({ showRecommendLevelModal: false }) }}
                />
            }
        </div>
    }
}

export default SeasonLeaderboard;