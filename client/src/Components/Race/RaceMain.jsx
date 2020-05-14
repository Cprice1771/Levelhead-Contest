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
import { Overlay, Tooltip } from 'react-bootstrap'
import RaceWinners from './RaceWinners';
import ConfigStore from '../../Stores/ConfigStore';

const ENDPOINT = "localhost:3000";

class RaceMain extends Component {

    constructor(props) {
        super(props);
        this.state = {
            room: null,
            loggedIn: UserStore.getLoggedInUser(),
            showJoinModal: false,
            socket: null,
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.userChange = this.userChange.bind(this);
        this.joinRace = this.joinRace.bind(this);
        this.isEntered = this.isEntered.bind(this);
        this.canBookmark = this.canBookmark.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.tooptipRef = React.createRef();
        this.keepAliveInterval = null
    }

    componentDidMount() {
        UserStore.addChangeListener(this.userChange);
        this.loadRoom();
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userChange);
        clearInterval(this.keepAliveInterval);
    }

    isEntered() {
        return this.state.loggedIn && !!_.find(this.state.room.entrants, x => x.userId === UserStore.getLoggedInUser()._id)
    }

    scheduleKeepAlives = () => {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = setInterval(() => {
            this.state.socket.emit('keep-alive', {
                roomId: this.state.room._id,
                userId: this.state.loggedIn._id
            })
        }, 30000);
    }

    userChange() {
        this.setState({loggedIn: UserStore.getLoggedInUser()}, () => {
            if(this.isEntered()) {
               this.scheduleKeepAlives();
            }
        });
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
        }, () => {
            this.scheduleKeepAlives();
        });

        

        NotificationManager.success('Room Joined');
    }

    async loadRoom() {
        var resp = await HttpClient.get(endPoints.GET_ROOM);
        if(!!resp) { 
            const socket = socketIOClient(ConfigStore.getUrl());   
            this.setState({
                room: resp.data,
                socket: socket
            }, () => {
                if(this.isEntered()) {
                    this.scheduleKeepAlives();
                }
            });
            socket.on(`room-update-${resp.data._id}`, room => {

                if(this.state.room.phase === 'downtime' && room.phase === 'level') {
                    var audio = new Audio('/assets/hjm-glass_bell_1.wav');
                    audio.play();
                }

                this.setState({
                    room
                });
            });
        }
        
    }

    canBookmark() {
        return !!UserStore.getLoggedInUser() && UserStore.getLoggedInUser().apiKey;
    }

    async bookmark(lookupCodes) {

        var res = await HttpClient.post(endPoints.BOOKMARK_SUBMISSION, {
            lookupCodes: lookupCodes,
            apiKey: UserStore.getLoggedInUser().apiKey,
        });

        if(res.success) {
            NotificationManager.success('Bookmarked');
        } else {
            NotificationManager.error(res.msg);
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

        clearInterval(this.keepAliveInterval);
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
            // if(!!resp) {
            //     this.setState({
            //         room: resp.data
            //     });
            // }
        } else {
            var startResp = await HttpClient.post(endPoints.START_LEVEL, {
                roomId: this.state.room._id
            });
            // if(!!startResp) {
            //     this.setState({
            //         room: startResp.data
            //     });
            // }
        }
    }

    waiting = () => {
        return (<div>
            { this.state.room && this.state.room.phase === 'downtime' && <span style={{ width: '100%', textAlign:'center' }}><h1>Finding next level...</h1></span>}
            { this.state.room && this.state.room.phase === 'level' && <span style={{ width: '100%', textAlign:'center' }}><h1>Getting scores...</h1></span>}
            <div className='spinner-container'><img className='rotate-slide' width='100' height='100' src='/assets/item_whizblade_0.png' /></div>
        
        </div>
        )
    }

    render() {
        if(!this.state.room) {
            return <div>Loading...</div>
        }
        
        return <div className="card race-card"> 
            <div className={"card-header-race"}>
                <div className="card-text">
                    <h2>Multiplayer Race</h2>  
                </div>
            </div>
            { moment(this.state.room.nextPhaseStartTime).diff(new Date(), 'seconds') <= 0 ? this.waiting() : 
            <>
                <div className="card-body">
                    { this.isEntered() && this.state.loggedIn && <button className='b1'  onClick={() => this.leaveRace()}>Leave</button> }
                    { !this.isEntered() && this.state.loggedIn && <button className='b1'  onClick={() => this.joinRace()}>Enter</button> }
                    { !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Enter</button> }

                    {/* <button className='b2'  onClick={() => { this.startNextPhase(); }}>Start Next Phase</button>
                    <button className='b2'  onClick={() => { this.updateScores(); }}>Update Scores</button> */}
                </div>

                <div className="card-rules pad-bottom">
                    { this.state.room.phase === 'level' && <>
                        <div className='row justify-content-center'>
                            <h1>{this.state.room.levelDetails ? this.state.room.levelDetails.title : ''}</h1>
                        </div>
                        <div className='row justify-content-center'>
                            <a className='racelevellink' ref={this.tooptipRef}
                            onBlur={() => { this.setState({showTooltip: false}) }}
                                onClick={(e) => {
                                    navigator.clipboard.writeText(this.state.room.currentLevelCode);
                                    this.setState({ showTooltip: true });
                                    setTimeout(() => {
                                        this.setState({ showTooltip: false });
                                    }, 1000);
                                }}>
                                    {this.state.room.currentLevelCode}<i className="fas fa-copy"></i>
                            </a>
                            { this.canBookmark && 
                                <span className='race-bookmark'><i className='fas fa-bookmark fa-5x' style={{color: '#7D6B91', cursor: 'pointer'}} onClick={() => { this.bookmark([this.state.room.currentLevelCode])}}> </i></span>
                            }
                    
                            <Overlay target={this.tooptipRef.current} show={this.state.showTooltip}  placement="right">
                                {(props) => (
                                <Tooltip id="overlay-example" {...props}>
                                    <span style={{ fontSize: '25px' }}>Copied</span>
                                </Tooltip>
                                )}
                            </Overlay>
                        </div>

                        <CountDown playSound toDate={this.state.room.nextPhaseStartTime} onTimeRunOut={() =>{ 
                            this.setState({ forceRender: new Date().getTime() }) }} title={``}/>
                        </>
                    }

                    { this.state.room.phase === 'downtime' && <>
                        <RaceWinners winners={this.state.room.entrants} />
                        <CountDown toDate={this.state.room.nextPhaseStartTime} onTimeRunOut={() =>{ 
                            this.setState({ forceRender: new Date().getTime() }) }} title={`Next level starts in`}/>
                        </>
                    }

                    <RaceEntrants 
                        entrants={this.state.room.entrants}
                    />
                </div>
            </>
        }
            
            <JoinRace 
                showModal={this.state.showJoinModal}
                handleCloseModal={() => { this.setState({ showJoinModal: false }) }}
                joinRace={this.joinRace}
            />
        </div>
            
    }

}

export default RaceMain;