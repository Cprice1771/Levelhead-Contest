import React, { Component } from 'react';
import SubmissionStore from '../Stores/SubmissionStore';
import ContestStore from '../Stores/ContestStore';

import Submission from './Submission';
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { NotificationManager} from 'react-notifications';
import { debug } from 'util';
import UserStore from '../Stores/UserStore';


class SubmissionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submissions: SubmissionStore.getSubmissions(),
            canVote: false,
            showVotes: this.contestOver(ContestStore.getSelectedContest()),
            myVotes: [],
        };

        this.submissionsChanged = this.submissionsChanged.bind(this);
        this.vote = this.vote.bind(this);
        this.unvote = this.unvote.bind(this);
        this.contestChange = this.contestChange.bind(this);
        this.getMyVotes = this.getMyVotes.bind(this);
        this.getCanVote = this.getCanVote.bind(this);
        this.userChanged = this.userChanged.bind(this);
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
                        showVotes: this.contestOver(ContestStore.getSelectedContest()) 
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
        return dateNow > new Date(contest.submissionEndDate) && dateNow < new Date(contest.votingEndDate) && !!UserStore.getLoggedInUser();
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

    render() {
        let submissions = _.map(this.state.submissions, s => {
            return <Submission 
            vote={this.vote} 
            unvote={this.unvote} 
            submission={s} 
            hasVotedFor={_.includes(this.state.myVotes, s._id )}
            key={s._id}  
            canVote={this.state.canVote} 
            showVotes={this.state.showVotes}
            />
        })

        return (<div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Lookup Code</th>
                        <th>Creator</th>
                        <th>Title</th>
                        <th>Clear Rate</th>
                        <th>Attempts</th>
                        {/* <th>{this.state.showVotes && <div className="col-md-2">Votes</div>}</th> */}
                        {this.state.showVotes && <th>Votes</th> }
                        {this.state.canVote && <th></th> }
                    </tr>
                </thead>
                <tbody>
                {submissions.length > 0 ? submissions : <tr><td>No Submissions Yet!</td></tr>}
                </tbody>
            </table>

            <div className="card-body">
                <NavLink exact to={`/contest/${this.props.match.params.contestId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                    <button className='b1' >Back To Contest</button> 
                </NavLink>
            </div>
        </div>
        )
    }
}

export default SubmissionList;