import React, { Component } from 'react';
import ContestStore from '../Stores/ContestStore';
import * as _ from 'lodash';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { NotificationManager} from 'react-notifications';
import ScoreRow from './ScoreRow';
import moment from 'moment';

class TopScores extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            contestInfo: ContestStore.getSelectedContest()
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

        this.setState({contestInfo: ContestStore.getSelectedContest()});

        try {
            let resp = await axios.get(endPoints.GET_CONTEST_TOP_SCORES(ContestStore.getSelectedContest()._id));
            this.assignPlace(resp.data, 'total');
            this.setState({ scores: resp.data });
        } catch (ex) {
            NotificationManager.error('Failed to load contest results');
        }
    }

    
    render() {
        let countCrowns = this.state.contestInfo ? this.state.contestInfo.countCrowns: false;
        let countShoes = this.state.contestInfo ? this.state.contestInfo.countShoes: false;

        let scores = _.map(this.state.scores, (res, idx) => {
            return <ScoreRow 
                key={idx}
                score={res}
                countCrowns={countCrowns}
                countShoes={countShoes}
            />
        })

        let lastUpdatedDate = 'N/A';
        if(ContestStore.getSelectedContest()) {
            lastUpdatedDate = moment(ContestStore.getSelectedContest().lastUpdatedScores).format('MM/DD/YYYY hh:mm A');
        }
        
        
        return (
        <>
        
        <div className="submission-container" >
        <div className='row'>
            <div className='col-9'>
                <h1 style={{ marginLeft: '10px'}}>Top Scores</h1>
            </div>
            <div className='col-3'>
                <div style={{  position: 'absolute',
                                bottom: 0,
                                left: 0, }}>Last updated ({lastUpdatedDate})</div>
            </div>
        </div>
        
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Place</th>
                        <th>User</th>
                        { countShoes  && <th>Shoes</th>}
                        { countCrowns && <th>Crowns</th>}
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