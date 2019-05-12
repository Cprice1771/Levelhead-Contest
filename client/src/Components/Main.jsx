import React, { Component } from 'react';
import { Route, Redirect  } from 'react-router';
import Contest from './Contest';
import SubmissionList from './SubmissionList';

class Main extends Component {

    render() {
        return (
            <div className='container'>
                <div className="nav">
      
                </div>
                <div className="header">
                    <div className="header-text">
                        <h1>LEVELCUP</h1>
                        <h3>Community Levelhead Contests</h3>

                    </div>
                </div>
                <div className="content-body">
                    <Route exact path="/" render={() => (<Redirect to="/contest/5ccb38a9a60c5628346eb1e3"/>)}/>
                    <Route path='/contest/:contestId' component={Contest} />
                    <Route path='/submissions/:contestId' component={SubmissionList} />
                </div>
            </div>
        );
    }
}

export default Main;