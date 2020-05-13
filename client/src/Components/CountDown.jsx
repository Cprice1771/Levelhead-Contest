import React, { Component } from 'react';
import * as moment from 'moment';

class CountDown extends Component {

    constructor(props) {
        super(props);

        this.state = {
        }

        this.updateTimeLeft = this.updateTimeLeft.bind(this);
        this.intervalHandle = null;
    };
    
    componentDidMount() {
        this.intervalHandle = setInterval(this.updateTimeLeft, 1000);
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalHandle);
    }

    updateTimeLeft() {

        if(moment(this.props.toDate).diff(new Date(), 'seconds') === 0) {
            var audio = new Audio('./assets/hjm-glass_bell_1.wav');
            audio.play();
            if(this.props.onTimeRunOut) {
                this.props.onTimeRunOut();
            }
        }

        this.setState({ curDate: new Date() });
    }

    render() {

        if(!this.props.toDate) {
            return null;
        }

        let formatTime = (num) => {
            return ('0' + num).substr(-2);
        }

        let currDate = moment();
        let endDate = moment(this.props.toDate);
        let days = endDate.diff(currDate, 'days');
        currDate = currDate.add(days, 'days');

        let hours = endDate.diff(currDate, 'hours');
        currDate = currDate.add(hours, 'hours');

        let minutes = endDate.diff(currDate, 'minutes');
        currDate = currDate.add(minutes, 'minutes');

        let seconds = endDate.diff(currDate, 'seconds');

        return <div className="clock-container"> 
                    <h1>{this.props.title}</h1>
                    <div className='row justify-content-center'>
                        {!!days && <div className="timeBox"><h4 className='timeTitle'>Days</h4> <span>{formatTime(days)} </span> </div>}
                        {!!hours && <div className="timeBox"><h4 className='timeTitle'>Hours</h4>  <span>{formatTime(hours)} </span></div> }
                        <div className="timeBox"><h4 className='timeTitle'>Minutes</h4>  <span>{formatTime(minutes)} </span></div> 
                        <div className="timeBox"><h4 className='timeTitle'>Seconds</h4>  <span>{formatTime(seconds)}</span></div>
                    </div>
                </div>
    }
}

export default CountDown