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
import ResultRow from './ResultRow';
import { timingSafeEqual } from 'crypto';
import ScoreRow from './ScoreRow';

class TopScores extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        };

        this.getContestResults = this.getContestResults.bind(this);
        this.assignPlace = this.assignPlace.bind(this);
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.getContestResults);
        if(!!ContestStore.getSelectedContest()) {
            this.getContestResults();
        }
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.getContestResults);
    }

    assignPlace(results, column) {

        if(results.length === 0) {
            return;
        }

        let currentPlace = 1;

        results[0].position = currentPlace;
        for(var i = 1; i < results.length; i++) {
            if(results[i][column] < results[i-1][column]) {
                currentPlace = i+1;
            }

            results[i].position = currentPlace;
        }
    }

    async getContestResults() {
        try {
            let resp = await axios.get(endPoints.GET_CONTEST_TOP_SCORES(ContestStore.getSelectedContest()._id));
            this.assignPlace(resp.data, 'total');
            this.setState({ scores: resp.data });
        } catch (ex) {
            NotificationManager.error('Failed to load contest results');
            console.log(ex);
        }
    }

    
    render() {
       
        let scores = _.map(this.state.scores, (res, idx) => {
            return <ScoreRow 
                key={idx}
                score={res}
            />
        })

        return (
        <>
        
        <div className="submission-container" >
        <h1>Top Scores</h1>
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Place</th>
                        <th>User</th>
                        <th>Shoes</th>
                        <th>Crowns</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                {scores}
                </tbody>
            </table>
        </div>
        
        </>
        )
    }
}

export default TopScores;