import React, { Component } from 'react';
import ReactModal from 'react-modal';


class JoinRace extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rumpusId: ''
        }

        this.isValid = this.isValid.bind(this);
    }

    componentDidMount() {
        this.setState({
            rumpusId: '',
        })
    }

    isValid() {
        return this.state.rumpusId.length === 6;
    }

    render() {

        return (
        <ReactModal
          isOpen={this.props.showModal}
          onRequestClose={this.props.handleCloseModal}
          contentLabel="Enter Rumpus Id"
          className='Modal'
        >
        <i className="fas fa-times modalClose"  onClick={this.props.handleCloseModal}></i>
        <div className="submit-box">
            <h3>
               Enter Race
            </h3>
            <h5>We need a rumpus Id for you so we can count your scores.</h5>
            <div className='row input-group'>
                <div className='col-md-4'>
                    Rumpus Id (<a href="https://www.bscotch.net/account" target="blank">found here</a>)
                </div>
                <div className='col-md-8'>
                    
                    <input type='text' className="form-control"
                        value={this.state.rumpusId} 
                        onChange={(e) => {
                            let newVal = e.target.value;
                            newVal = newVal.substring(0, Math.min(newVal.length, 6))
                            this.setState({ rumpusId: newVal });
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
                    this.props.joinRace(this.state.rumpusId);
                    this.props.handleCloseModal();
                }}>
                Join Race
            </button>
           
            
        </div>
        </ReactModal>);
    }
}

export default JoinRace;