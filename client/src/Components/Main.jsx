import React, { Component } from 'react';
import { Route, Redirect  } from 'react-router';
import Contest from './Contest';
import SubmissionList from './SubmissionList';



class Main extends Component {

    render() {
        return (
            <div className='main__container'>
            <Route exact path="/" render={() => (<Redirect to="/contest"/>)}/>
                <Route path='/contest' render={() => <Contest />} />
                <Route path='/submissions' render={() => <SubmissionList />} />
            </div>
        );
    }
}

export default Main;