import React, { Component } from 'react';
import SubmissionStore from '../Stores/SubmissionStore';
import Submission from './Submission';
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import {NotificationContainer, NotificationManager} from 'react-notifications';

class SubmissionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submissions: SubmissionStore.getSubmissions()
        };

        this.submissionsChanged = this.submissionsChanged.bind(this);
        this.vote = this.vote.bind(this);
    }

    componentDidMount() {
        SubmissionStore.addChangeListener(this.submissionsChanged);
        SubmissionStore.loadSubmissionsForContest('5ccb38a9a60c5628346eb1e3');
    }

    componentWillUnmount() {
        SubmissionStore.removeChangeListener(this.submissionsChanged);
    }

    submissionsChanged() {
        this.setState({ submissions: SubmissionStore.getSubmissions() });
    }

    vote(levelId) {
        axios.post(endPoints.VOTE, {
            contestId: '5ccb38a9a60c5628346eb1e3',
            submissionId: levelId,
            discordId: 'ab12a3',
        }).then(res => {
            if(res.data.success) {
                NotificationManager.success('Vote Submitted!');
                SubmissionStore.loadSubmissionsForContest('5ccb38a9a60c5628346eb1e3');
            } else {

                NotificationManager.error(res.data.msg);
            }
        }).catch(res => {
            NotificationManager.error(res.data.msg);
        });
    }

    render() {
        if(!this.state.submissions || this.state.submissions.length == 0) {
            return <div>No Submissions Yet!</div>;
        }

        let submissions = _.map(this.state.submissions, s => {
            return <Submission vote={this.vote} submission={s} key={s._id.$oid}/>
        })

        return <div>
            <div className="submissionsList">
            <div className="row">
                <div className="col-md-2">Lookup code</div>
                <div className="col-md-2">Creator</div>
                <div className="col-md-2">Title</div>
                <div className="col-md-2">Created At</div>
                <div className="col-md-2">Votes</div>
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