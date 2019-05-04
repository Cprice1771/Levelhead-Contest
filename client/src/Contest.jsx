import React, { Component } from 'react';
import * as _ from 'lodash';
import ContestStore from './Stores/ContestStore';
import ConfigStore from './Stores/ConfigStore';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'

class Contest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contest: null,
            currDate : moment(),
            timer: null,
        };

        this.contestsLoaded = this.contestsLoaded.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.updateTimeLeft = this.updateTimeLeft.bind(this);
        this.intervalHandle = null;
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestsLoaded);
        ContestStore.getContests();

        this.intervalHandle = setInterval(this.updateTimeLeft, 500);
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestsLoaded);
        clearInterval(this.intervalHandle);
    }

    contestsLoaded(data) {
        this.setState({
            contest: ContestStore.contests()[0]
        })
    }

    formatTime(num) {
        return ('0' + num).substr(-2);
    }

    updateTimeLeft() {

        if(!this.state.contest) {
            return;
        }

        let currDate = moment();
        let endDate = moment(this.state.contest.submissionEndDate);

        let days = endDate.diff(currDate, 'days');
        currDate = currDate.add(days, 'days');

        let hours = endDate.diff(currDate, 'hours');
        currDate = currDate.add(hours, 'hours');

        let minutes = endDate.diff(currDate, 'minutes');
        currDate = currDate.add(minutes, 'minutes');

        let seconds = endDate.diff(currDate, 'seconds');

        this.setState({
            days, hours, minutes, seconds
        });
    }

    render() {
        if(!this.state.contest) {
            return <div>Loading...</div>
        }
       

        return <div className="contest"> 
            <h1>{this.state.contest.name}</h1>
            <h2>Theme</h2> <ReactMarkdown source={this.state.contest.theme} />
            <h2>Rules</h2> 
            <div style={{ width: '75%', display: 'block', marginLeft: 'auto', marginRight: 'auto', textAlign:'left'}}><ReactMarkdown source={this.state.contest.rules} />
            </div>

            <p>
            <div>Time Left </div>
            <span className="timeBox">{this.formatTime(this.state.days)} </span> :
            <span className="timeBox">{this.formatTime(this.state.hours)}</span> :
            <span className="timeBox">{this.formatTime(this.state.minutes)}</span> :
            <span className="timeBox">{this.formatTime(this.state.seconds)}</span>
            </p>
            
            

            <button className='btn btn-primary'>Submit a Level</button>
        </div>
    }

}

export default Contest;