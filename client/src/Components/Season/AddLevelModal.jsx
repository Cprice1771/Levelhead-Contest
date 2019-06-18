import React, { Component } from 'react';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';
import ReactModal from 'react-modal';
import { Form, FormControl, FormCheck, Col, Alert } from 'react-bootstrap'
import Flatpickr from 'react-flatpickr'
import { NotificationManager } from 'react-notifications';

class AddLevelModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            lookupCode: '',
            diamondValue: 0,
            goldValue: 0,
            silverValue: 0,
            bronzeValue: 0,
            startDate: '',
            selectedLevelTitle: '',
        }

        this.isValid = this.isValid.bind(this);
        this.clearState = this.clearState.bind(this);
    }

    componentDidMount() {
       this.clearState();
    }

    clearState() {
        this.setState({
            lookupCode: '',
            diamondValue: 0,
            goldValue: 0,
            silverValue: 0,
            bronzeValue: 0,
            startDate: '',
            selectedLevelTitle: '',
        })
    }

    validateLevel(code){
        axios.post(endPoints.VALIDATE_LEVELS, { levelIds: [code] }).then(async res => {
            if(res.data.success && res.data.data.length === 1) {
                this.setState({
                    selectedLevelTitle: res.data.data[0].title,
                });
            } else {
                NotificationManager.error('Could not find level');
                this.setState({
                    selectedLevelTitle: null,
                });
            }

            
        }).catch(res => {
            NotificationManager.error('Error getting level');
            this.setState({
                selectedLevelTitle: null,
            });
        });
    }

    isValid() {
        return this.state.lookupCode.length === 7 && 
                +this.state.diamondValue > 0 &&
                +this.state.goldValue > +this.state.diamondValue &&
                +this.state.silverValue > +this.state.goldValue &&
                +this.state. bronzeValue > +this.state.silverValue;
    }

    render() {

        return (
        <ReactModal
          isOpen={this.props.showModal}
          onRequestClose={() =>{
            this.clearState();
            this.props.handleCloseModal();
          }}
          contentLabel="Enter Rumpus Id"
          className='Modal big-modal'
        >
        <i className="fas fa-times modalClose"  onClick={() =>{
            this.clearState();
            this.props.handleCloseModal();
          }}></i>
        <div className="submit-box">
            <h3>
               Add Level
            </h3>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Lookup Code
                </div>
                <div className='col-md-4'>
                    
                    <input type='text' className="form-control"
                        value={this.state.lookupCode} 
                        onChange={(e) => {
                            let newVal = e.target.value;
                            newVal = newVal.substring(0, Math.min(newVal.length, 7))
                            this.setState({ lookupCode: newVal });
                            if(newVal.length === 7) {
                                this.validateLevel(newVal);
                            } else {
                                this.setState({ selectedLevelTitle: '' });
                            }
                        }}
                    />
                </div>
                <div className='col-md-4'>
                    {this.state.selectedLevelTitle}
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Level Start Date
                </div>
                <div className='col-md-8'>
                    <Flatpickr 
                        data-enable-time 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        placeholder='Now'
                        value={this.state.startDate}
                        onChange={date => { this.setState({ startDate: date[0] })}}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Diamond Time
                </div>
                <div className='col-md-8'>
                    
                <input type='number' className="form-control"
                        value={this.state.diamondValue} 
                        onChange={(e) => {
                            this.setState({ diamondValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Gold Time
                </div>
                <div className='col-md-8'>
                    
                <input type='number' className="form-control"
                        value={this.state.goldValue} 
                        onChange={(e) => {
                            this.setState({ goldValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Silver Time
                </div>
                <div className='col-md-8'>
                    
                <input type='number' className="form-control"
                        value={this.state.silverValue} 
                        onChange={(e) => {
                            this.setState({ silverValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Bronze Time
                </div>
                <div className='col-md-8'>
                    
                    <input type='number' className="form-control"
                        value={this.state.bronzeValue} 
                        onChange={(e) => {
                            this.setState({ bronzeValue: e.target.value });
                        }}
                    />
                </div>
            </div>

             

            <div className='error'>
                <span>{this.state.error}</span>
            </div>

            <button 
                className={'btn pull-right-down btn-primary'} 
                disabled={!this.isValid()} 
                onClick={() => { this.props.addLevel(this.state); 
                                this.setState({
                                    lookupCode: '',
                                    diamondValue: 0,
                                    goldValue: 0,
                                    silverValue: 0,
                                    bronzeValue: 0,
                                    startDate: ''
                                }); 
                                }}>
                Add
            </button>
           
            
        </div>
        </ReactModal>);
    }
}

export default AddLevelModal;