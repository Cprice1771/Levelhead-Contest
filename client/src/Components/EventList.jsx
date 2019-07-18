import React, { Component } from 'react';

import * as _ from 'lodash';
import axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { NotificationManager} from 'react-notifications';
import EventCard from './EventCard';

class ContestList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            showAll: false
        };
        this.loadEvents = this.loadEvents.bind(this);
    }

    componentDidMount() {
        this.loadEvents();
    }

    componentWillUnmount() {
        
    }

    async loadEvents() {
        try {
            let res = await axios.get(endPoints.GET_EVENTS( this.state.showAll ? 'all' : 'active'));
        if(res.data.success) {
                let sorted = _.orderBy(res.data.data, ['endDate'], ['desc'] );
                this.setState({ events: sorted });
        } else {
            NotificationManager.error(res.data.msg);
        }
         }
        catch(res) {
            if(res && res.response && res.response.data)
                NotificationManager.error(res.response.data.msg);
            else {
                NotificationManager.error('Connection Error');
            }
    }
    }

    
    render() {

        let events = this.state.events.map(x => {
            return <EventCard 
                {...x}
            />
        })
        
        

        return <>
        <div className='pull-right'><span>
                    <span className="switch-label">Show All Events</span>
                    <label className="switch ">
                        
                        <input type="checkbox" 
                        checked={this.state.showAll} 
                        onChange={() => {
                            this.setState({ showAll: !this.state.showAll}, () => {
                                this.loadEvents();
                            });
                        }}
                        />
                        <span className="slider round"></span>
                </label>
            </span>
        </div>
        <div>
        {events.length > 0 ? 
                            events : 
                            <div style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'center',
                                paddingTop: '100px'
                            }}> 
                                <h2>No events found</h2>
                            </div> 
        }
        </div></>
    }
}

export default ContestList;