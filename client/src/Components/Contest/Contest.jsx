import React, { Component } from 'react';
import ContestStore from '../../Stores/ContestStore';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'
import ReactModal from 'react-modal';
import Submit from './Submit';
import { NavLink } from 'react-router-dom';
import UserStore from '../../Stores/UserStore';
import LoginActions from '../../actions/LoginActions';
import Results from './Results';

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

        this.contestsLoaded = this.contestsLoaded.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.updateTimeLeft = this.updateTimeLeft.bind(this); 
        this.intervalHandle = null;

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.userChange = this.userChange.bind(this);
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestsLoaded);
        ContestStore.getContest(this.props.match.params.contestId);
        UserStore.addChangeListener(this.userChange);
        
        this.intervalHandle = setInterval(this.updateTimeLeft, 1000);
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestsLoaded);
        UserStore.removeChangeListener(this.userChange);
        clearInterval(this.intervalHandle);
    }

    userChange() {
        this.setState({loggedIn: !!UserStore.getLoggedInUser()});
    }

    contestsLoaded(data) {
        this.setState({
            contest: ContestStore.getSelectedContest()
        }, () => {
            this.updateTimeLeft();
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


        let waitingToStart = this.state.contest.contestType === 'building' && new Date(this.state.contest.startDate) > new Date();
        let submissionOpen = this.state.contest.contestType === 'building' && new Date(this.state.contest.startDate) < new Date() && new Date(this.state.contest.submissionEndDate) > new Date();
        let votingOpen = this.state.contest.contestType === 'building' && new Date(this.state.contest.submissionEndDate) < new Date() && new Date(this.state.contest.votingEndDate) > new Date();
        let speedrunOpen = this.state.contest.contestType === 'speedrun' && new Date(this.state.contest.votingEndDate) > new Date();

        if(waitingToStart) {
            endDate = moment(this.state.contest.startDate);
        } else if (submissionOpen) {
            endDate = moment(this.state.contest.submissionEndDate);
        } else if(votingOpen || speedrunOpen) {
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
       
        let waitingToStart = this.state.contest.contestType === 'building' && new Date(this.state.contest.startDate) > new Date();
        let submissionOpen = this.state.contest.contestType === 'building' && new Date(this.state.contest.startDate) < new Date() && new Date(this.state.contest.submissionEndDate) > new Date();
        let votingOpen = this.state.contest.contestType === 'building' && new Date(this.state.contest.submissionEndDate) < new Date() && new Date(this.state.contest.votingEndDate) > new Date();
        let speedrunOpen = this.state.contest.contestType === 'speedrun' && new Date(this.state.contest.votingEndDate) > new Date();
        let contestOver = new Date(this.state.contest.votingEndDate) < new Date();

        return <div className="card"> 
            <div className={"card-header-contest"}>
                <div className="card-text">
                    <h2>{this.state.contest.name}</h2>
                    <h3> { submissionOpen && 'Submission Deadline - ' + moment(this.state.contest.submissionEndDate).format('MMM Do')} 
                    {votingOpen && 'Voting Ends - ' + moment(this.state.contest.votingEndDate).format('MMM Do') }</h3>

                    <h5><ReactMarkdown source={this.state.contest.theme} /></h5>
                   
                </div>
            </div>

            { (waitingToStart || submissionOpen || votingOpen || speedrunOpen) &&

                <div className="clock-container"> 
                    {waitingToStart && <h4>Time left until submissions open</h4>}
                    {submissionOpen && <h4>Time Left Until Submissions Close</h4>}
                    {votingOpen && <h4>Time left until voting closes</h4>}
                    {speedrunOpen && <h4>Time left until contest is over</h4>}
                    <div className='row justify-content-center'>
                        <div className="timeBox"><h4 className='timeTitle'>Days</h4> <span>{this.formatTime(this.state.days)} </span> </div>
                        <div className="timeBox"><h4 className='timeTitle'>Hours</h4>  <span>{this.formatTime(this.state.hours)} </span></div> 
                        <div className="timeBox"><h4 className='timeTitle'>Minutes</h4>  <span>{this.formatTime(this.state.minutes)} </span></div> 
                        <div className="timeBox"><h4 className='timeTitle'>Seconds</h4>  <span>{this.formatTime(this.state.seconds)}</span></div>
                    </div>
                </div>
                }

                <div className="card-body">
                    { submissionOpen && this.state.loggedIn && <button className='b1'  onClick={this.handleOpenModal}>Submit</button> }
                    { submissionOpen && !this.state.loggedIn && <button className='b1'  onClick={() => { LoginActions.initiateLogin(); }}>Login to Submit</button> }
                    { !waitingToStart && 
                        <NavLink exact to={`/submissions/${this.props.match.params.contestId}`} 
                            className="NavButton"
                            activeClassName="activeRoute">
                            <button className='b2' >View Entries</button>
                        </NavLink> }
                </div>

            <div className="card-rules pad-bottom">
                
                { contestOver && 
                    <div>
                    <Results contestType={this.state.contest.contestType}/>
                    </div>
                }
                <h1 style={{ textAlign: 'center' }}>Rules</h1>
                <ReactMarkdown source={this.state.contest.rules} />
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
        </div>
    }

}

export default Contest;