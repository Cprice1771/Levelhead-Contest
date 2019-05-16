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
import LoginActions from '../actions/LoginActions';
import ResultRow from './ResultRow';
import { timingSafeEqual } from 'crypto';

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: []
        };

        this.contestChange = this.contestChange.bind(this);
        this.assignPlace = this.assignPlace.bind(this);
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestChange);
        if(!!ContestStore.getSelectedContest()) {
            this.contestChange();
        }
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestChange);
    }

    assignPlace(results) {
        let currentPlace = 1;

        results[0].position = currentPlace;
        for(var i = 1; i < results.length; i++) {
            if(results[i].votes < results[i-1].votes) {
                currentPlace = i+1;
            }

            results[i].position = currentPlace;
        }
    }

    async contestChange() {
        try {
            let resp = await axios.get(endPoints.GET_CONTEST_RESULTS(ContestStore.getSelectedContest()._id));
            this.assignPlace(resp.data);


            this.setState({ results: resp.data });
        } catch (ex) {
            NotificationManager.error('Failed to load contest results');
        }
    }

    
    render() {
       

        let results = _.map(this.state.results, (res, idx) => {
            return <ResultRow 
                key={idx}
                votes={res.votes}
                title={res.levelMetaData.map.Title}
                position={res.position}
                rumpusUserName={res.rumpusUserName}
            />
        })

        return (<div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Place</th>
                        <th>Creator</th>
                        <th>Title</th>
                        <th>Votes</th>
                    </tr>
                </thead>
                <tbody>
                {results}
                </tbody>
            </table>
        </div>
        )
    }
}

export default Results;