import React, { Component } from 'react';
import * as _ from 'lodash';
import ContestStore from '../Stores/ContestStore';
import ConfigStore from '../Stores/ConfigStore';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'
import ReactModal from 'react-modal';
import Submit from './Submit';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { NavLink } from 'react-router-dom';

const customStyles = {
    content : {
    //   top                   : '50%',
    //   left                  : '50%',
    //   right                 : 'auto',
    //   bottom                : 'auto',
    //   marginRight           : '-50%',
    //   transform             : 'translate(-50%, -50%)'
    }
  };

class Contest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contest: null,
            currDate : moment(),
            timer: null,
            showModal: false,
        };

        this.contestsLoaded = this.contestsLoaded.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.updateTimeLeft = this.updateTimeLeft.bind(this); 
        this.intervalHandle = null;

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestsLoaded);
        ContestStore.getContest(this.props.match.params.contestId);

        this.intervalHandle = setInterval(this.updateTimeLeft, 1000);
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestsLoaded);
        clearInterval(this.intervalHandle);
    }

    contestsLoaded(data) {
        this.setState({
            contest: ContestStore.getSelectedContest()
        })
    }

    handleOpenModal () {
        this.setState({ showModal: true });
      }
      
      handleCloseModal () {
        this.setState({ showModal: false });
      }

    formatTime(num) {
        return ('0' + num).substr(-2);
    }

    updateTimeLeft() {

        if(!this.state.contest) {
            return;
        }



        let currDate = moment();
        let endDate;


        let waitingToStart = new Date(this.state.contest.startDate) > new Date();
        let submissionOpen = new Date(this.state.contest.startDate) < new Date() && new Date(this.state.contest.submissionEndDate) > new Date();
        let votingOpen = new Date(this.state.contest.submissionEndDate) < new Date() && new Date(this.state.contest.votingEndDate) > new Date();

        if(waitingToStart) {
            endDate = moment(this.state.contest.startDate);
        } else if (submissionOpen) {
            endDate = moment(this.state.contest.submissionEndDate);
        } else if(votingOpen) {
            endDate = moment(this.state.contest.votingEndDate);
        } else {
            endDate = moment();
        }
        

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
        if(!this.state.contest) {
            return <div>Loading...</div>
        }
       

        let waitingToStart = new Date(this.state.contest.startDate) > new Date();
        let submissionOpen = new Date(this.state.contest.startDate) < new Date() && new Date(this.state.contest.submissionEndDate) > new Date();
        let votingOpen = new Date(this.state.contest.submissionEndDate) < new Date() && new Date(this.state.contest.votingEndDate) > new Date();

        return <div className="card"> 
            <div class="card-header">
                <div class="card-text">
                    <h2>{this.state.contest.name}</h2>
                    <h3> {moment(this.state.contest.startDate).format('MMM Do')} - {moment(this.state.contest.votingEndDate).format('MMM Do')}</h3>
                    <h5><ReactMarkdown source={this.state.contest.theme} /></h5>
                </div>
            </div>

            <div class="card-rules"><ReactMarkdown source={this.state.contest.rules} />
            </div>
            { (waitingToStart || submissionOpen || votingOpen) &&

            <div className="clock-container"> 
                {waitingToStart && <h4>Time left until submission open</h4>}
                {submissionOpen && <h4>Time Left Until Submissions Close</h4>}
                {votingOpen && <h4>Time left until voting closes</h4>}

                <span className="timeBox">{this.formatTime(this.state.days)} </span>
                <span className="timeBox">{this.formatTime(this.state.hours)}</span> 
                <span className="timeBox">{this.formatTime(this.state.minutes)}</span> 
                <span className="timeBox">{this.formatTime(this.state.seconds)}</span>
            </div>
            }
            
            <div class="card-body">
                { submissionOpen && <button className='b1'  onClick={this.handleOpenModal}>Submit</button> }

                <NavLink exact to={`/submissions/${this.props.match.params.contestId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                    <button className='b2' >View Entries</button>
                </NavLink>
                </div>
            <ReactModal
          isOpen={this.state.showModal}
         
          onRequestClose={this.handleCloseModal}
          
          contentLabel="Level Submit"
          className='Modal'
        >
                <i className="fas fa-times modalClose"  onClick={this.handleCloseModal}></i>
                <Submit  onClose={this.handleCloseModal} contestId={this.props.match.params.contestId}/>
            </ReactModal>
            <NotificationContainer/>
        </div>
    }

}

export default Contest;