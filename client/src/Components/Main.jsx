import React, { Component } from 'react';
import { Route, Redirect  } from 'react-router';
import Contest from './Contest';
import SubmissionList from './SubmissionList';



class Main extends Component {

    render() {
        return (
            <div className='container'>
                <div class="nav">
      
                </div>
                <div class="header">
                    <div class="header-text">
                        <h1>levelcup</h1>
                        <h3>community levelhead design contests</h3>

                    </div>
                </div>
                <div class="content-body">
                    <Route exact path="/" render={() => (<Redirect to="/contest"/>)}/>
                    <Route path='/contest' render={() => <Contest />} />
                    <Route path='/submissions' render={() => <SubmissionList />} />
                </div>
            </div>
        );
    }
}

export default Main;