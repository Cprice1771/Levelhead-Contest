import React, { Component } from 'react';
import SubmissionStore from '../Stores/SubmissionStore';
import ContestStore from '../Stores/ContestStore';

import Submission from './Submission';
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { NotificationManager} from 'react-notifications';
import UserStore from '../Stores/UserStore';
import LoginActions from '../actions/LoginActions';
import TopScores from './TopScores';

class SubmissionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submissions: SubmissionStore.getSubmissions(),
            canVote: false,
            showVotes: this.contestOver(ContestStore.getSelectedContest()),
            myVotes: [],
            hidePlayed: false,
            contestInfo: ContestStore.getSelectedContest()
        };

        this.submissionsChanged = this.submissionsChanged.bind(this);
        this.vote = this.vote.bind(this);
        this.unvote = this.unvote.bind(this);
        this.contestChange = this.contestChange.bind(this);
        this.getMyVotes = this.getMyVotes.bind(this);
        this.getCanVote = this.getCanVote.bind(this);
        this.userChanged = this.userChanged.bind(this);
        this.togglePlayed = this.togglePlayed.bind(this);
        this.bookmarkAll = this.bookmarkAll.bind(this);
        this.bookmark = this.bookmark.bind(this);
    }

    componentDidMount() {
        this.setState({canVote: this.getCanVote(ContestStore.getSelectedContest())});
        this.getMyVotes();
        ContestStore.addChangeListener(this.contestChange);
        ContestStore.getContest(this.props.match.params.contestId);        
        SubmissionStore.addChangeListener(this.submissionsChanged);
        UserStore.addChangeListener(this.userChanged)
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestChange);
        SubmissionStore.removeChangeListener(this.submissionsChanged);
        UserStore.removeChangeListener(this.userChanged)
    }

    userChanged() {
        this.setState({canVote: this.getCanVote(ContestStore.getSelectedContest())});
        this.setState({ myVotes: [] })
        this.getMyVotes();
    }

    getMyVotes() {
        if(!UserStore.getLoggedInUser()){
            return;
        }

        axios.get(endPoints.GET_VOTES(this.props.match.params.contestId, UserStore.getLoggedInUser()._id))
        .then(res => {
        if(res.data.success) {
            let myVotes = _.map(res.data.data, x => x.submissionId);
            this.setState({ myVotes })
        } else {
            NotificationManager.error(res.data.msg);
        }
        }).catch(res => {
            if(res && res.response && res.response.data)
                NotificationManager.error(res.response.data.msg);
            else {
                NotificationManager.error('Connection Error');
            }
        });
    }

    contestChange() {
        this.setState({ canVote: this.getCanVote(ContestStore.getSelectedContest()),
                        showVotes: this.contestOver(ContestStore.getSelectedContest()),
                        contestInfo: ContestStore.getSelectedContest(), 
                    });
        SubmissionStore.loadSubmissionsForContest(ContestStore.getSelectedContest()._id);
    }

    contestOver(contest) {
        if(!contest) {
            return false;
        }
        return new Date() > new Date(contest.votingEndDate);
    }

    getCanVote(contest) {
        if(!contest){
            return false;
        }
        let dateNow = new Date();
        return contest.contestType === 'building' && dateNow > new Date(contest.submissionEndDate) && dateNow < new Date(contest.votingEndDate) && !!UserStore.getLoggedInUser();
    }

    submissionsChanged() {
        this.setState({ submissions: _.shuffle(SubmissionStore.getSubmissions()) });
    }

    unvote(levelId) {
        axios.post(endPoints.UNVOTE, {
            contestId: this.props.match.params.contestId,
            submissionId: levelId,
            userId: UserStore.getLoggedInUser()._id,
        }).then(res => {
            if(res.data.success) {
                let myVotes = _.cloneDeep(this.state.myVotes);
                _.remove(myVotes, x => x === levelId);

                let submissions = _.cloneDeep(this.state.submissions);
                let idx = _.findIndex(submissions, x => x._id === levelId);
                submissions[idx].votes--;

               this.setState({ myVotes, submissions });
            } else {
                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            if(res && res.response && res.response.data)
                NotificationManager.error(res.response.data.msg);
            else {
                NotificationManager.error('Connection Error');
            }
        });
    }

    bookmarkAll() {
        this.bookmark(this.state.submissions.map(x => x.lookupCode));
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

    vote(levelId) {
        axios.post(endPoints.VOTE, {
            contestId: this.props.match.params.contestId,
            submissionId: levelId,
            userId: UserStore.getLoggedInUser()._id,
        }).then(res => {
            if(res.data.success) {
                let myVotes = _.cloneDeep(this.state.myVotes);
                myVotes.push(levelId);

                let submissions = _.cloneDeep(this.state.submissions);
                let idx = _.findIndex(submissions, x => x._id === levelId);
                submissions[idx].votes++;

               this.setState({ myVotes, submissions });
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

    togglePlayed(id) {
        let idx = _.findIndex(this.state.submissions, x => x._id === id);
        let submissionCopy = _.cloneDeep(this.state.submissions);
        submissionCopy[idx].played = !submissionCopy[idx].played;
        this.setState({ submissions: submissionCopy });
    }

    render() {
        let contest = ContestStore.getSelectedContest();
        let dateNow = new Date();
        let inVotingPhase = !!contest && dateNow > new Date(contest.submissionEndDate) && dateNow < new Date(contest.votingEndDate);
        let loggedIn = !!UserStore.getLoggedInUser();
        let subs = this.state.submissions;
        if(this.state.hidePlayed) {
            subs = subs.filter(x => !x.played);
        }


        let submissions = _.map(subs, s => {
            return <Submission 
            canBookmark={!!UserStore.getLoggedInUser() && UserStore.getLoggedInUser().apiKey}
            bookmark={this.bookmark}
            vote={this.vote} 
            unvote={this.unvote} 
            togglePlayed={this.togglePlayed}
            submission={s} 
            hasVotedFor={_.includes(this.state.myVotes, s._id )}
            key={s._id}  
            canVote={this.state.canVote} 
            showVotes={this.state.showVotes}
            />
        })

        return (<div className="submission-container" >
            <div className="row submission-nav-row">
            <div className="col-md-12">
                <div className="pull-right">

                <button 
                onClick={this.bookmarkAll}
                 style={{
                    marginRight: '10px',
                    borderRadius: '5px',
                    border: 'none',
                    padding: '5px',
                    textDecoration: 'underline',
                    backgroundColor: 'transparent'
                }}>Bookmark All</button>

                <span className="switch-label">Hide Played</span>
                <label className="switch ">
                    
                    <input type="checkbox" 
                    checked={this.state.hidePlayed} 
                    onChange={() => {
                        this.setState({ hidePlayed: !this.state.hidePlayed});
                    }}
                    />
                    <span className="slider round"></span>
                </label>
                </div>
            </div>
            </div>
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Played</th>
                        <th>Lookup Code</th>
                        <th>Creator</th>
                        <th>Title</th>
                        <th>Plays</th>
                        <th>Clear Rate</th>
                        <th>Top Scores</th>
                        {/* <th>{this.state.showVotes && <div className="col-md-2">Votes</div>}</th> */}
                        {this.state.showVotes && <th>Votes</th> }
                        {this.state.canVote && <th></th> }
                    </tr>
                </thead>
                <tbody>
                {submissions.length > 0 ? submissions : <tr><td>No Submissions!</td></tr>}
                </tbody>
            </table>

            { this.state.contestInfo && this.state.contestInfo.displayTopScore && <TopScores /> } 

            <div className="card-body pad-bottom" style={{paddingBottom: '50px '}}>

             { inVotingPhase && !loggedIn && 
                        <button className='b1'
                         onClick={() => { LoginActions.initiateLogin(); }}>
                            Login to Vote!
                         </button> 
            }

                <NavLink exact to={`/contest/${this.props.match.params.contestId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                    <button className='b2' >Back To Contest</button> 
                </NavLink>
            </div>
        </div>
        )
    }
}

export default SubmissionList;