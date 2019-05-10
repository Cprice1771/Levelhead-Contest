import React, { Component } from 'react';
import SubmissionStore from '../Stores/SubmissionStore';
import ContestStore from '../Stores/ContestStore';

import Submission from './Submission';
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ConfigStore from '../Stores/ConfigStore';
import { debug } from 'util';

const discordId = 'ab12a3'

class SubmissionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submissions: SubmissionStore.getSubmissions(),
            canVote: this.getCanVote(ContestStore.getSelectedContest()),
            showVotes: this.contestOver(ContestStore.getSelectedContest()),
            shuffle: true,
        };

        this.submissionsChanged = this.submissionsChanged.bind(this);
        this.vote = this.vote.bind(this);
        this.unvote = this.unvote.bind(this);
        this.contestChange = this.contestChange.bind(this);
    }

    componentDidMount() {
        this.setState({shuffle: true});
        ContestStore.addChangeListener(this.contestChange);
        ContestStore.getContest(this.props.match.params.contestId);        
        SubmissionStore.addChangeListener(this.submissionsChanged);
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestChange);
        SubmissionStore.removeChangeListener(this.submissionsChanged);
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
        return dateNow > new Date(contest.submissionEndDate) && dateNow < new Date(contest.votingEndDate);
    }

    submissionsChanged() {
        this.setState({ submissions: _.shuffle(SubmissionStore.getSubmissions()) });
    }

    unvote(levelId) {
        axios.post(endPoints.UNVOTE, {
            contestId: this.props.match.params.contestId,
            submissionId: levelId,
            discordId: discordId,
        }).then(res => {
            if(res.data.success) {
               let submissionCopy = _.cloneDeep(this.state.submissions);
               let itemIdx = _.findIndex(submissionCopy, x => x._id === levelId);
               submissionCopy[itemIdx].votes =  _.remove(submissionCopy[itemIdx].votes, discordId);
               this.setState({ submissions: submissionCopy});
            } else {

                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            NotificationManager.error(res.response.data.msg);
        });
    }

    vote(levelId) {
        axios.post(endPoints.VOTE, {
            contestId: this.props.match.params.contestId,
            submissionId: levelId,
            discordId: discordId,
        }).then(res => {
            if(res.data.success) {
                let submissionCopy = _.cloneDeep(this.state.submissions);
               let itemIdx = _.findIndex(submissionCopy, x => x._id === levelId);
               submissionCopy[itemIdx].votes.push(discordId);
               this.setState({ submissions: submissionCopy});
            } else {

                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            NotificationManager.error(res.response.data.msg);
        });
    }

    render() {
        if(!this.state.submissions || this.state.submissions.length == 0) {
            return <div>No Submissions Yet!</div>;
        }


        let submissions = _.map(this.state.submissions, s => {
            return <Submission 
            vote={this.vote} 
            unvote={this.unvote} 
            submission={s} 
            key={s._id.$oid}  
            canVote={this.state.canVote} 
            showVotes={this.state.showVotes}
            discordId={discordId}/>
        })

        return <div >
            <div className="submissionsList">
            <div className="row header-row">
                <div className="col-md-2"><h5>Lookup code</h5></div>
                <div className="col-md-2"><h5>Creator</h5></div>
                <div className="col-md-4"><h5>Title</h5></div>
                <div className="col-md-1"><h5>Clear Rate</h5></div>
                <div className="col-md-1"><h5>Attempts</h5></div>
                {this.state.showVotes && <div className="col-md-2">Votes</div>}
                <div className="col-md-2"></div>
            </div>
            {submissions}
            </div>

            <div class="card-body">
                <NavLink exact to={`/contest/${this.props.match.params.contestId}`} 
                        className="NavButton"
                        activeClassName="activeRoute">
                    <button className='b1' >Back To Contest</button> 
                </NavLink>
            </div>
                <NotificationContainer/>
                
        </div>

    }
}

export default SubmissionList;