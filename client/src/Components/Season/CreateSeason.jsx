import React, { Component } from 'react';
import * as _ from 'lodash';
import 'flatpickr/dist/themes/material_blue.css'
import Flatpickr from 'react-flatpickr'
import Axios from 'axios';
import { endPoints } from '../../Constants/Endpoints';
import { Form, FormControl, FormCheck, Col, Alert } from 'react-bootstrap'
import { NotificationManager} from 'react-notifications';
import UserStore from '../../Stores/UserStore';

class CreateSeason extends Component {
    constructor(props) {
        super(props);

        var defaultEnd = new Date(new Date().setDate(new Date().getDate() + 14));
        defaultEnd.setHours(23);
        defaultEnd.setMinutes(59);

        this.state = {
            name: '',
            seasonType: 'speedrun',
            startDate: new Date(),
            endDate: defaultEnd,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.getDatesValid = this.getDatesValid.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        //wait a second when loading the page to wait for the user to log back in
      setTimeout(this.onUserChange, 1000);
      UserStore.addChangeListener(this.onUserChange)
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChange)
    }

    onUserChange() {
        let loggedInUser = UserStore.getLoggedInUser();
        if(!loggedInUser) {
            let currentUrl = window.location.href.split('create-season')[0];
            window.location.href = `${currentUrl}`;
        } else {
            this.setState({ createdBy: loggedInUser._id });
        }
    }


    getDatesValid() {
        return this.state.startDate < this.state.endDate && 
            new Date() < this.state.endDate;
        
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        this.setState({ validated: true });
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() && this.getDatesValid()) {
            Axios.post(endPoints.CREATE_SEASON, {
                name: this.state.name,
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                seasonType: this.state.seasonType,
                createdBy: this.state.createdBy,
            }).then(async res => {
                if(res.data.success) {
                    NotificationManager.success('Season Created!');
                    let currentUrl = window.location.href.split('create-season')[0];
                    window.location.href = `${currentUrl}seasons/${res.data.data._id}`;
                } else {
                    NotificationManager.error(res.data.msg);
                }
            }).catch(res => {
                if(res.response) {
                    NotificationManager.error(res.response.data.msg);
                } else {
                    NotificationManager.error('Something went wrong. Please Try again later.');
                }
                
            });
        }
        
    }
    
    
   
    render() {
        return (
        <div className="card"> 
            <div className="contest-body">
            <h1>Create New Season</h1>
            <Form
                noValidate
                validated={this.state.validated}
                onSubmit={e => this.handleSubmit(e)}
            >
                <Form.Group controlId="name">
                    <Form.Label>Season Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter contest Name" 
                                    required
                                    value={this.state.name} 
                                    onChange={e => { this.setState({ name: e.target.value })}} />
                </Form.Group>

                <Form.Group controlId="contestType">
                    <Form.Label>Season Type</Form.Label>
                    <Form.Control as="select" 
                                value={this.state.seasonType} 
                                onChange={e => { this.setState({ seasonType: e.target.value })}}>
                        <option value='speedrun'>Speedrun</option>
                        <option value='crowns'>Crown</option>
                    </Form.Control>
                </Form.Group>

                <Form.Row>
                <Form.Group controlId="startDate" as={Col}>
                    <Form.Label>Season Start Date</Form.Label>
                    <div>
                    <Flatpickr 
                        data-enable-time 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        value={this.state.startDate}
                        onChange={date => { this.setState({ startDate: date[0] })}}
                    />
                    </div>
                </Form.Group>

                
                <Form.Group controlId="endDate" as={Col}>
                    <Form.Label>Season End Date</Form.Label>
                    <div>
                    <Flatpickr 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        
                        data-enable-time 
                        value={this.state.endDate}
                        onChange={date => { this.setState({ endDate: date[0] })}}
                    />
                    </div>
                </Form.Group>
                {!this.getDatesValid() && 
                    <Alert variant='danger'>
                        Invalid dates. Ensure end is after start and season ends after today.
                    </Alert>
                }
                </Form.Row>
                
                <button 
                        type='submit'
                        className='b1 gbtn pull-right'
                    >
                    Create Season
                </button>
            </Form>
                            

            </div>
        </div>);
    }

}

export default CreateSeason;