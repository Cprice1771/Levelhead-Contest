import React, { Component } from 'react';
import posed from 'react-pose';

const ARow = posed.div({
    hidden: { 
        opacity: 0,
        y: -30,
    },
    visible: { 
        opacity: 1,
        y: 0,
     }
  });

class AccoladeRow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ 
                visible: true,
            })
        }, 100);
    }

    render() {
        return <ARow className='row accolade-row' pose={this.state.visible ? 'visible' : 'hidden'}> 
                    <div className='col-md-2'> <img  src={`${this.props.awardImage}`}  className='accolade-image'/> </div>
                    <div className='col-md-10'> <div className='accolade-title'>{this.props.award}</div> <div className='accolade-description'>{this.props.description}</div> </div>
                </ARow>
    }
}

export default AccoladeRow;