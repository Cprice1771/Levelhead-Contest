import React, { Component } from 'react';
import UserStore from '../Stores/UserStore';
import { endPoints } from '../Constants/Endpoints';
import { Form, Col } from 'react-bootstrap'
import { NotificationManager} from 'react-notifications';
import Axios from 'axios';

class UserProfile extends Component {

    constructor(props) {
        super(props);
        this.state= { ...UserStore.getLoggedInUser() } || {};

        this.onUserChange = this.onUserChange.bind(this);
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onUserChange);
        setTimeout(this.onUserChange, 1000);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChange);
    }

    onUserChange() {
        this.setState({ ...UserStore.getLoggedInUser() })
    }

    handleSubmit(event) {
        this.setState({ validated: true });
        event.preventDefault();
        event.stopPropagation();

    
        Axios.post(endPoints.SAVE_PROFILE(this.state._id), { apiKey: this.state.apiKey }).then(async res => {
            if(res.data.success) {
                NotificationManager.success('Info saved');
                UserStore.setLoggedInUser(res.data.data);
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

    render() {
        return <div className="card"> 
                <div className="contest-body">
                <h1>Profile</h1>
                <Form
                    noValidate
                    onSubmit={e => this.handleSubmit(e)}
                >
                    <Form.Group controlId="ApiKey">
                        <Form.Label>Discord Id</Form.Label>
                        <Form.Control type="text"
                                        value={this.state.discordId} 
                                        disabled />
                    </Form.Group>

                    <Form.Group controlId="ApiKey">
                        <Form.Label>Rumpus Lookup Code</Form.Label>
                        <Form.Control type="text"
                                        value={this.state.rumpusId} 
                                        disabled />
                    </Form.Group>

                    <Form.Group controlId="ApiKey">
                        
                        <Form.Label>Delegation Key</Form.Label>
                        
                        <Form.Control type="text"
                                        value={this.state.apiKey} 
                                        onChange={e => { 
                                            this.setState({ apiKey: e.target.value })}} /><span><a target="_blank" rel="noopener noreferrer" href="https://www.bscotch.net/account?delegationPermissions=rce-lh-read,rce-lh-manage-bookmarks&delegationKeyName=levelcup">Get key</a></span>
                        <div className='pull-right'><a href="https://www.bscotch.net/rumpus-ce" target="_blank" rel="noopener noreferrer"><i>What is this?</i></a></div>
                    </Form.Group>
                    { this.state.keyPermissions &&
                    <>
                    <h3>Key Permissions</h3>
                    <Form.Row>
                        
                    <Form.Group controlId="1" as={Col} >
                        <Form.Check 
                            custom
                            type={'checkbox'}
                            id={`keyCanReadData`}
                            label={`Read Levelhead Data`}
                            checked={this.state.keyPermissions && this.state.keyPermissions.includes('rce-lh-read')}
                            disabled
                        />
                        </Form.Group>
                        <Form.Group controlId="2" as={Col}>
                        <Form.Check 
                            custom
                            type={'checkbox'}
                            id={`keyCanReportUsers`}
                            label={`Report Other Users`}
                            checked={this.state.keyPermissions && this.state.keyPermissions.includes('rce-lh-report')}
                            disabled
                        />
                        </Form.Group>
                        <Form.Group controlId="3" as={Col}>
                        <Form.Check 
                            
                            custom
                            type={'checkbox'}
                            id={`keyCanBookmark`}
                            label={`Can Make Bookmarks`}
                            checked={this.state.keyPermissions && this.state.keyPermissions.includes('rce-lh-manage-bookmarks')}
                            disabled
                        />
                        </Form.Group>
                    </Form.Row>
                    </>
                    }

                    <div className='row'>
                        <div className='col-md-12'>
                        <button 
                                type='submit'
                                className='b1 gbtn'>
                            Save
                        </button>
                        </div>
                    </div>
                </Form>
            
            
            </div>
        </div>
    }
}
export default UserProfile;