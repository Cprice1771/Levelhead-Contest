import React, { Component } from 'react';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';
import ReactModal from 'react-modal';
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
            bonusAward: 'NONE',
            bonusValue: '',
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
            bonusAward: 'NONE',
            bonusValue: '',
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
                +this.state.bronzeValue > +this.state.silverValue &&
                (this.state.bonusAward === 'NONE' || !!this.state.bonusValue)
                ;
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
                <div className='col-md-5'>
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
                <div className='col-md-3'>
                    {this.state.selectedLevelTitle}
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-5'>
                    Level Start Date
                </div>
                <div className='col-md-7'>
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
                <div className='col-md-5'>
                    Diamond Time
                </div>
                <div className='col-md-7'>
                    
                <input type='number' className="form-control"
                        value={this.state.diamondValue} 
                        onChange={(e) => {
                            this.setState({ diamondValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-5'>
                    Gold Time
                </div>
                <div className='col-md-7'>
                    
                <input type='number' className="form-control"
                        value={this.state.goldValue} 
                        onChange={(e) => {
                            this.setState({ goldValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-5'>
                    Silver Time
                </div>
                <div className='col-md-7'>
                    
                <input type='number' className="form-control"
                        value={this.state.silverValue} 
                        onChange={(e) => {
                            this.setState({ silverValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-5'>
                    Bronze Time
                </div>
                <div className='col-md-7'>
                    
                    <input type='number' className="form-control"
                        value={this.state.bronzeValue} 
                        onChange={(e) => {
                            this.setState({ bronzeValue: e.target.value });
                        }}
                    />
                </div>
            </div>
            <div className='row input-group'>
                <div className='col-md-5'>
                    <select className="form-control"
                        value={this.state.bonusAward} onChange={(e) => {
                            this.setState({ bonusAward: e.target.value });
                            if(e.target.value === 'NONE') {
                                this.setState({ bonusValue: ''})
                            }
                        }}
                    >   
                        <option value='NONE'>--None--</option>
                        {
                            this.props.awards && this.props.awards.map(award => {
                                return <option value={award.awardName} key={award.awardName}>{award.awardName} </option>
                            })
                        }
                    </select>
                </div>
                <div className='col-md-7'>
                    
                    <input type='number' className="form-control"
                        value={this.state.bonusValue} 
                        disabled={this.state.bonusAward==='NONE'}
                        onChange={(e) => {
                            this.setState({ bonusValue: e.target.value });
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
                onClick={() => { 
                    
                    let level = {
                        lookupCode: this.state.lookupCode,
                        diamondValue: this.state.diamondValue,
                        goldValue: this.state.goldValue,
                        silverValue: this.state.silverValue,
                        bronzeValue: this.state.bronzeValue,
                        startDate: this.state.startDate,
                        bonusAward: this.state.bonusAward === 'NONE' ? undefined : {
                            awardValue: this.state.bonusValue,
                            awardName: this.state.bonusAward,
                            awardIcon: this.props.awards.find(x => x.awardName === this.state.bonusAward).awardIcon
                        }
                    }

                    this.props.addLevel(level); 
                    this.setState({
                        lookupCode: '',
                        diamondValue: 0,
                        goldValue: 0,
                        silverValue: 0,
                        bronzeValue: 0,
                        bonusValue: '',
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