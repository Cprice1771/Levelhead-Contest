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
            let res = await axios.get(endPoints.GET_ACTIVE_EVENTS)
        if(res.data.success) {
                let sorted = _.orderBy(res.data.data, ['endDate'], ['asc'] );
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
        
        <div>{events}</div></>
    }
}

export default ContestList;