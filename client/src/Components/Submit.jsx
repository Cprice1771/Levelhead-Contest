import React, { Component } from 'react';
import Axios from 'axios';
import { endPoints } from '../Constants/Endpoints';

import { NotificationManager} from 'react-notifications';

class Submit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            levelCode: '',
            overwrite: false,
            error: null,
        };

        this.submitLevel = this.submitLevel.bind(this);
        this.validate = this.validate.bind(this);
    }


    componentDidMount() {
        this.setState({
            levelCode: '',
            overwrite: false,
            error: null,
        })
    }

    submitLevel() {
        Axios.post(endPoints.CREATE_SUBMISSION, {
            contestId: this.props.contestId,
            lookupCode: this.state.levelCode,
            submittedByDiscordId: this.state.discordId,
            overwrite: this.state.overwrite,
        }).then(res => {
            if(res.data.success) {
                this.props.onClose();
                NotificationManager.success('Level Successfully Submitted!');
            } else {
                this.setState({
                    error: res.data.msg,
                    overwrite: !!res.data.requiresOverwrite
                })
            }
        }).catch(res => {
            this.setState({
                error: res.response.data.msg,
                overwrite: false
            })
        });
    }
    

    validate() {
        return !!this.state.levelCode && this.state.levelCode.length === 7
                && !!this.state.discordId && this.state.discordId.length > 3;
    }

    render() {


        

        return (
        <div className="submit-box">
            <h3>
               Submit a level to the contest!  
            </h3>
            <div className='row input-group'>
            <div className='col-md-4'>
                Level Code
            </div>
            <div className='col-md-8'>
                
                <input type='text' className="form-control"
                    value={this.state.levelCode} 
                    onChange={(e) => {
                        this.setState({ levelCode: e.target.value });
                    }}
                />
            </div>
               
            </div>

             <div className='row input-group'>
            <div className='col-md-4'>
                Discord Id
            </div>
            <div className='col-md-8'>
                
                <input type='text' className="form-control"
                    value={this.state.discordId} 
                    onChange={(e) => {
                        this.setState({ discordId: e.target.value });
                    }}
                />
            </div>
               
            </div>


            <div className='error'>
                <span>{this.state.error}</span>
            </div>
            <button 
                        className={'btn pull-right-down ' + (this.state.overwrite ? 'btn-danger' : 'btn-primary')} 
                        disabled={!this.validate()} 
                        onClick={this.submitLevel}>
                        {this.state.overwrite ? 'Overwrite' : 'Save'}
                    </button>
            
            
        </div>);
    }
    

}

export default Submit;