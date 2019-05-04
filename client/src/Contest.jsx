import React, { Component } from 'react';
import * as _ from 'lodash';
import ContestStore from './Stores/ContestStore';


class Contest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contest: null
        };
    }

    componentDidMount() {
        ContestStore.addChangeListener(this.contestsLoaded);
        ContestStore.getContests();
    }

    componentWillUnmount() {
        ContestStore.removeChangeListener(this.contestsLoaded);
    }

    contestsLoaded = (data) => {
        this.setState({
            contest: data[0]
        })
    }

    render() {

        if(!this.state.contest) {
            return <div>Loading...</div>
        }

        return <div> 
            {JSON.stringify(this.state.contest)}
        </div>
    }

}

export default Contest;