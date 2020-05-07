import React, { Component } from 'react';
import * as moment from 'moment';
import ReactModal from 'react-modal';
import UserStore from '../../Stores/UserStore';
import LoginActions from '../../actions/LoginActions';
import { endPoints } from '../../Constants/Endpoints'
import { NotificationManager} from 'react-notifications';
import HttpClient from '../../Util/HttpClient';
import * as _ from 'lodash';
import JoinRace from './JoinRace';
import RaceEntrants from './RaceEntrants';
import CountDown from '../CountDown';
import socketIOClient from "socket.io-client";
const ENDPOINT = "localhost:3000";

class RaceMain extends Component {

    constructor(props) {
        super(props);
        this.state = {
            room: null,
            loggedIn: UserStore.getLoggedInUser(),
            showJoinModal: false,
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.userChange = this.userChange.bind(this);
        this.joinRace = this.joinRace.bind(this);
    }

    componentDidMount() {
        UserStore.addChangeListener(this.userChange);
        this.loadRoom();


        const socket = socketIOClient(ENDPOINT);
        socket.on('message', message => {
            console.log(message);
        })
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userChange);
        clearInterval(this.intervalHandle);
    }

    isEntered() {
        return this.state.loggedIn && !!_.find(this.state.room.entrants, x => x.userId === UserStore.getLoggedInUser()._id)
    }

    userChange() {
        this.setState({loggedIn: UserStore.getLoggedInUser()});
    }

    handleOpenModal () {
        this.setState({ showJoinModal: true });
    }
    
    handleCloseModal () {
        this.setState({ showJoinModal: false });
    }

    async joinRace(rumpusId) {
        if(!rumpusId && !this.state.loggedIn.rumpusId) {
            this.setState({ showJoinModal: true });
            return;
        }


        if(!UserStore.getLoggedInUser()) {
            NotificationManager.error('Please login first');
        }

        var resp = await HttpClient.post(endPoints.ENTER_ROOM, {
            roomId: this.state.room._id,
            userId: UserStore.getLoggedInUser()._id,
            rumpusId: rumpusId,
        });
        this.setState({
            room: resp.data
        });
        NotificationManager.success('Room Joined');
    }

    async loadRoom() {
        var resp = await HttpClient.get(endPoints.GET_ROOM);
        if(!!resp) {    
                this.setState({
                room: resp.data
            });
        }
        
    }

    async leaveRace() {
        var resp = await HttpClient.post(endPoints.LEAVE_RACE, {
            roomId: this.state.room._id,
            userId: this.state.loggedIn._id
        });

        NotificationManager.success('Room Left')
        this.setState({
            room: resp.data
        });
    }

    async updateScores() {
        var resp = await HttpClient.post(endPoints.GET_SCORES, {
            roomId: this.state.room._id
        });
    }

    async startNextPhase() {
        if(this.state.room.phase === 'level') {
            var resp = await HttpClient.post(endPoints.START_DOWNTIME, {
                roomId: this.state.room._id
            });
            if(!!resp) {
                this.setState({
                    room: resp.data
                });
            }
        } else {
            var startResp = await HttpClient.post(endPoints.START_LEVEL, {
                roomId: this.state.room._id
            });
            if(!!startResp) {
                this.setState({
                    room: startResp.data
                });
            }
        }
    }

    render() {
        if(!this.state.room) {
            return <div>Loading...</div>
        }
       
        
        return <div className="card"> 
            <div className={"card-header-race"}>
                <div className="card-text">
                    <h2>Multiplayer Race</h2>
                    <h3> subheader </h3>
                    <h5>other info</h5>
                   
                </div>
            </div>

            

            <div className="card-body">
                { this.isEntered() && this.state.loggedIn && <button className='b1'  onClick={() => this.leaveRace()}>Leave</button> }
                { !this.isEntered() && this.state.loggedIn && <button className='b1'  onClick={() => this.joinRace()}>Enter</button> }
                { !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Enter</button> }

                <button className='b2'  onClick={() => { this.startNextPhase(); }}>Start Next Phase</button>
                <button className='b2'  onClick={() => { this.updateScores(); }}>Update Scores</button>
            </div>

            <div className="card-rules pad-bottom">
                { this.state.room.phase === 'level' && <>
                <h1>Current Level: {this.state.room.currentLevelCode}</h1>
                <CountDown toDate={this.state.room.nextPhaseStartTime} title={`Time left in level`}/>
                </>
                }

                { this.state.room.phase === 'downtime' && <>
                <CountDown toDate={this.state.room.nextPhaseStartTime} title={`Next level starts in`}/>
                </>
                }

                <RaceEntrants 
                    entrants={this.state.room.entrants}
                />
            </div>
            
            <JoinRace 
                showModal={this.state.showJoinModal}
                handleCloseModal={() => { this.setState({ showJoinModal: false }) }}
                joinRace={this.joinRace}
            />
        </div>
    }

}

export default RaceMain;