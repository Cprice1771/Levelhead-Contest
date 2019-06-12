import React, { Component } from 'react';
import ContestStore from '../Stores/ContestStore';
import * as _ from 'lodash';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { NotificationManager} from 'react-notifications';
import ResultRow from './ResultRow';
import ScoreRow from './ScoreRow';

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            contestInfo: ContestStore.getSelectedContest()
        };

        this.contestChange = this.getContestResults.bind(this);
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

        this.setState({ contestInfo: ContestStore.getSelectedContest()})

        try {
            let resp = await axios.get(endPoints.GET_CONTEST_RESULTS(ContestStore.getSelectedContest()._id));
            this.assignPlace(resp.data.submissions, 'votes');
            this.assignPlace(resp.data.scores, 'total');
            this.setState({ results: resp.data.submissions, scores: resp.data.scores });
        } catch (ex) {
            NotificationManager.error('Failed to load contest results');
        }
    }

    
    render() {
       

        let countCrowns = this.state.contestInfo && this.state.contestInfo.countCrowns;
        let countShoes = this.state.contestInfo && this.state.contestInfo.countShoes;

        let results = _.map(this.state.results, (res, idx) => {
            return <ResultRow 
                key={idx}
                votes={res.votes}
                title={res.levelMetaData.title}
                position={res.position}
                rumpusUserName={res.rumpusUserName}
            />
        })

        let scores = _.map(this.state.scores, (res, idx) => {
            return <ScoreRow 
                key={idx}
                score={res}
                countShoes={countShoes}
                countCrowns={countCrowns}
            />
        });

        return (
        <>
        {this.props.contestType === 'building' &&
            <>
            <h1>Results</h1>
            <div className="submission-container" >
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
            </>
        }
        
        { this.state.contestInfo && (this.state.contestInfo.displayTopScore || this.props.contestType === 'speedrun')  && 
            <><h1>Top Scores</h1> 
            <div className="submission-container" >
                <table className="table submission-header table-striped">
                    <thead>
                        <tr>
                            <th>Place</th>
                            <th>User</th>
                            { countShoes && <th>Shoes</th> }
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
        }
        
        </>
        )
    }
}

export default Results;