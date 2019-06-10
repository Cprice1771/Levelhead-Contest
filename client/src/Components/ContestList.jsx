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
import ContestCard from './ContestCard';

class ContestList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contests: [],
            
        };
        this.loadContests = this.loadContests.bind(this);
    }

    componentDidMount() {
        this.loadContests();
    }

    componentWillUnmount() {
        
    }

    loadContests() {
        axios.get(endPoints.GET_ACTIVE_CONTESTS)
        .then(res => {
        if(res.data.success) {
            let sorted= _.orderBy(res.data.data, ['votingEndDate'], ['asc'] );
            this.setState({ contests:sorted });
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

    
    render() {

        let contests = this.state.contests.map(x => {
            return <ContestCard 
                {...x}
            />
        })

        return <>
        
        <div>{contests}</div></>
    }
}

export default ContestList;