import React, { Component } from 'react';
import * as moment from 'moment';
//import ReactMarkdown from 'react-markdown'
import ReactModal from 'react-modal';
import UserStore from '../../Stores/UserStore';
import LoginActions from '../../actions/LoginActions';
import { endPoints } from '../../Constants/Endpoints'
import { NotificationManager} from 'react-notifications';
import HttpClient from '../../Util/HttpClient';
import * as _ from 'lodash';

class Contest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            room: null,
            loggedIn: !!UserStore.getLoggedInUser(),
            showModal: false,
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.userChange = this.userChange.bind(this);
    }

    componentDidMount() {
        UserStore.addChangeListener(this.userChange);
        this.loadRoom();
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.userChange);
        clearInterval(this.intervalHandle);
    }

    isEntered() {
        return this.state.loggedIn && !!_.find(this.state.room.entrants, x => x.userId === UserStore.getLoggedInUser().userId)
    }

    userChange() {
        this.setState({loggedIn: !!UserStore.getLoggedInUser()});
    }

    handleOpenModal () {
        this.setState({ showModal: true });
    }
    
    handleCloseModal () {
        this.setState({ showModal: false });
    }

    async joinRoom() {
        if(!UserStore.getLoggedInUser()) {
            NotificationManager.error('Please login first');
        }
        var resp = await HttpClient.post(endPoints.ENTER_ROOM, {
            roomId: this.state.room._id,
            userId: UserStore.getLoggedInUser().userId
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
                { !this.isEntered() && this.state.loggedIn && <button className='b1'  onClick={this.handleOpenModal}>Enter</button> }
                { !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Enter</button> }

                <button className='b2'  onClick={() => { this.startNextPhase(); }}>Start Next Phase</button>
            </div>

            <div className="card-rules pad-bottom">
                { this.state.room.phase === 'level' && <>
                <h1>Current Level: {this.state.room.currentLevelCode}</h1>
                <h3>Minutes left in Level: { moment.duration(moment(this.state.room.nextPhaseStartTime).diff(moment())).asMinutes() }</h3>
                </>
                }
            </div>

            <div className="card-rules pad-bottom">
                { this.state.room.phase === 'downtime' && <>
                <h1>Winners!</h1>
                <h3>Next level in: { moment.duration(moment(this.state.room.nextPhaseStartTime).diff(moment())).asMinutes() }</h3>
                </>
                }
            </div>
            
            <ReactModal
                isOpen={this.state.showModal}
                
                onRequestClose={this.handleCloseModal}
                
                contentLabel="Enter Race"
                className='Modal'
                >
                <i className="fas fa-times modalClose"  onClick={this.handleCloseModal}></i>
                <div className='row'> 
                <div className='col-md-6'>Enter your rumpus id:</div>
                    <div>
                        <input  type='text' value={this.state.rumpusId} onChange={(x) => this.setState({ rumpusId: x.target.value})} />
                    </div>
                </div>
                <div>
                    <button onClick={() => {
                        console.log('Join!');
                        this.handleCloseModal();
                    }}>Join</button>
                </div>
            </ReactModal>
        </div>
    }

}

export default Contest;