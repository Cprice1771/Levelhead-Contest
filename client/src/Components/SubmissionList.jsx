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
            showVotes: this.contestOver(ContestStore.getSelectedContest())
        };

        this.submissionsChanged = this.submissionsChanged.bind(this);
        this.vote = this.vote.bind(this);
        this.contestChange = this.contestChange.bind(this);
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestChange);
        ContestStore.getContests();
        SubmissionStore.addChangeListener(this.submissionsChanged);
        SubmissionStore.loadSubmissionsForContest('5ccb38a9a60c5628346eb1e3');
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
            contestId: '5ccb38a9a60c5628346eb1e3',
            submissionId: levelId,
            discordId: discordId,
        }).then(res => {
            if(res.data.success) {
               // NotificationManager.success(res.data.msg);
                SubmissionStore.loadSubmissionsForContest('5ccb38a9a60c5628346eb1e3');
            } else {

                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            NotificationManager.error(res.response.data.msg);
        });
    }

    vote(levelId) {
        axios.post(endPoints.VOTE, {
            contestId: '5ccb38a9a60c5628346eb1e3',
            submissionId: levelId,
            discordId: discordId,
        }).then(res => {
            if(res.data.success) {
                //NotificationManager.success(res.data.msg);
                SubmissionStore.loadSubmissionsForContest('5ccb38a9a60c5628346eb1e3');
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

        return <div>
            <div className="submissionsList">
            <div className="row">
                <div className="col-md-2">Lookup code</div>
                <div className="col-md-2">Creator</div>
                <div className="col-md-4">Title</div>
                <div className="col-md-2">Created At</div>
                {this.state.showVotes && <div className="col-md-2">Votes</div>}
                <div className="col-md-2"></div>
            </div>
            {submissions}
            </div>

            <button className='btn btn-primary' >
                <NavLink exact to='/contest' 
                    className="NavButton"
                    activeClassName="activeRoute">Back To Contest</NavLink></button>
                <NotificationContainer/>
        </div>

    }
}

export default SubmissionList;