import React, { Component } from 'react';
import ContestStore from '../Stores/ContestStore';
import * as moment from 'moment';
import * as _ from 'lodash';
import 'flatpickr/dist/themes/material_blue.css'
 
import Flatpickr from 'react-flatpickr'
import Axios from 'axios';
import { endPoints } from '../Constants/Endpoints';
import { Form, FormControl, FormCheck, Col, Alert } from 'react-bootstrap'
import { NotificationManager} from 'react-notifications';
import UserStore from '../Stores/UserStore';

const MAX_LEVELS_PER_CONTEST = 10;

class ContestCreator extends Component {

    constructor(props) {
        super(props);


        var defaultSubEnd = new Date(new Date().setDate(new Date().getDate() + 1));
        defaultSubEnd.setHours(23);
        defaultSubEnd.setMinutes(59);

        var defaultVoteEnd = new Date( new Date().setDate(new Date().getDate() + 2));
        defaultVoteEnd.setHours(23);
        defaultVoteEnd.setMinutes(59);

        this.state = {
            error: null,
            validated: false,
            name: '',
            theme: '',
            rules: '',
            startDate: new Date(),
            submissionEndDate: defaultSubEnd,
            votingEndDate: defaultVoteEnd,
            contestType: 'building',
            countCrowns: true,
            countShoes: true,
            maxVotePerUser: 3,
            displayTopScore: true,
            allowPreviousLevels: false,
            requireDailyBuild: false,
            requireLevelInTower: false,
            canVoteForSelf: true,
            contestLevels: [''],
            levelDetails: null,
            loadingLevels: false,
            speedrunLevelErrors: null,
            levelsValid: false,

        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.getSpeedRunValid = this.getTopScoresValid.bind(this);
        this.isValid = this.isValid.bind(this);
        this.getDatesValid = this.getDatesValid.bind(this);
        this.getReasonableDates = this.getReasonableDates.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.getLevelNameFromId = this.getLevelNameFromId.bind(this);
        this.checkLevels = this.checkLevels.bind(this);
        this.isLevelInvalid = this.isLevelInvalid.bind(this);
    }

    componentDidMount() {
        //wait a second when loading the page to wait for the user to log back in
      setTimeout(this.onUserChange, 1000);
      UserStore.addChangeListener(this.onUserChange)
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChange)
    }

    onUserChange() {
        let loggedInUser = UserStore.getLoggedInUser();
        if(!loggedInUser) {
            let currentUrl = window.location.href.split('create-contest')[0];
            window.location.href = `${currentUrl}`;
        } else {
            this.setState({ createdBy: loggedInUser._id });
        }
    }


    isValid() {
        return this.getDatesValid() && this.getTopScoresValid() && this.getReasonableDates();
    }

    getDatesValid() {
        if(this.state.contestType === 'building') {
            return this.state.startDate < this.state.submissionEndDate && 
            this.state.submissionEndDate < this.state.votingEndDate && 
            new Date() < this.state.submissionEndDate;
        } else {
            return this.state.startDate < this.state.votingEndDate && 
            new Date() < this.state.submissionEndDate;
        }
        
    }

    getTopScoresValid() {
        return (this.state.contestType !== 'speedrun' && !this.state.displayTopScore) 
                || (this.state.countShoes || this.state.countCrowns);

    }

    getSpeedRunLevelsValid() {
        return (this.state.contestType !== 'speedrun' ) || (this.state.contestLevels.length > 1)

    }

    getReasonableDates() {
        return moment().diff(moment(this.state.startDate), 'days') <= 7  && 
                Math.abs(moment(this.state.startDate).diff(moment(this.state.votingEndDate), 'days')) <= 28
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        this.setState({ validated: true });
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() && this.isValid()) {
            Axios.post(endPoints.CREATE_CONTEST, {
                name: this.state.name,
                theme: this.state.theme,
                prizes: this.state.prizes,
                rules: this.state.rules,
                createdBy: this.state.createdBy,
                startDate: this.state.startDate || new Date(),
                submissionEndDate: this.state.submissionEndDate,
                votingEndDate: this.state.votingEndDate,
                /*Contest Type */
                contestType: this.state.contestType,
                /*Speedrun Contest Rules */
                countCrowns: this.state.countCrowns,
                countShoes: this.state.countShoes,
                /*Builder Contest Rules */
                maxVotePerUser: this.state.maxVotePerUser,
                displayTopScore: this.state.displayTopScore,
                allowPreviousLevels: this.state.allowPreviousLevels,
                requireDailyBuild: this.state.requireDailyBuild,
                requireLevelInTower: this.state.requireLevelInTower,
                canVoteForSelf: this.state.canVoteForSelf,
                contestLevels: this.state.contestLevels.filter(x => !!x),
            }).then(async res => {
                if(res.data.success) {
                    NotificationManager.success('Contest Created!');
                    let currentUrl = window.location.href.split('create-contest')[0];
                    window.location.href = `${currentUrl}contest/${res.data.data._id}`;
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
        
    }
    
    checkLevels() {
        let contestLevels = _.clone(this.state.contestLevels).filter(x => x.length > 0);
        if(contestLevels.length <= 0) {
            this.setState({
                speedrunLevelErrors: 'You must enter at least one level',
                loadingLevels: false,
                levelDetails: null,
            });
            return;
        }

        for(var lookupCode of contestLevels) {
            if(this.isLevelInvalid(lookupCode)) {
                this.setState({
                    speedrunLevelErrors: 'Invalid level',
                    loadingLevels: false,
                    levelDetails: null,
                });
                return;
            }
        }

        this.setState({
            speedrunLevelErrors: null,
            loadingLevels: true,
            levelDetails: null,
        })

        Axios.post(endPoints.VALIDATE_LEVELS, { levelIds: contestLevels }).then(async res => {
            if(res.data.success) {
                let levelsValid = true;

                for(var lookupCode of contestLevels) {
                    if(_.findIndex(res.data.data, x => x.name === lookupCode) < 0) {
                        levelsValid = false;
                        break;
                    }
                }


                this.setState({
                    speedrunLevelErrors: null,
                    loadingLevels: false,
                    levelDetails: res.data.data,
                    levelsValid
                });
            } else {
                this.setState({
                    speedrunLevelErrors: res.data.msg,
                    loadingLevels: false,
                    levelDetails: null,
                });
            }

            
        }).catch(res => {
            if(res.response) {
                this.setState({
                    speedrunLevelErrors: res.response.data.msg,
                    loadingLevels: false,
                    levelDetails: null,
                });
            } else {
                this.setState({
                    speedrunLevelErrors: 'Something went wrong try again later.',
                    loadingLevels: false,
                    levelDetails: null,
                });
            }
        });
    }

    getLevelNameFromId(lookupCode) {

        let level = _.find(this.state.levelDetails, x => x.name === lookupCode)
        if(level && level.map) {
            return level.map.Title
        }
        return '';
    }

    isLevelInvalid(lookupCode) {

        if(lookupCode.length === 0) {
            return false;
        }

        return lookupCode.length < 7 || _.filter(this.state.contestLevels, x => x === lookupCode).length !== 1 ||
                (!!this.state.levelDetails && _.findIndex(this.state.levelDetails, x => x.name === lookupCode) < 0);
    }
   
    render() {
        return (
        <div className="card"> 
            <div className="contest-body">
            <h1>Create Contest</h1>
            <Form
                noValidate
                validated={this.state.validated}
                onSubmit={e => this.handleSubmit(e)}
            >
                <Form.Group controlId="name">
                    <Form.Label>Contest Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter contest Name" 
                                    required
                                    value={this.state.name} 
                                    onChange={e => { this.setState({ name: e.target.value })}} />
                </Form.Group>

                <Form.Group controlId="theme">
                    <Form.Label>Contest Theme</Form.Label>
                    <Form.Control 
                            required type="text" placeholder="Contest Theme"
                            value={this.state.theme} 
                            onChange={e => { this.setState({ theme: e.target.value })}}
                     />
                </Form.Group>

                <Form.Group controlId="rules">
                    <Form.Label>Contest Rules</Form.Label>
                    <Form.Control required as="textarea" placeholder="Contest Rules" style={{height: '300px'}} 
                                    value={this.state.rules} 
                                    onChange={e => { this.setState({ rules: e.target.value })}}
                    />
                </Form.Group>

                <Form.Group controlId="contestType">
                    <Form.Label>Contest Type</Form.Label>
                    <Form.Control as="select" 
                                value={this.state.contestType} 
                                onChange={e => { this.setState({ contestType: e.target.value, levelsValid: false, levelDetails: null})}}>
                        <option value='building'>Building</option>
                        <option value='speedrun'>Speedrun</option>
                    </Form.Control>
                </Form.Group>

                <Form.Row>
                <Form.Group controlId="startDate" as={Col}>
                    <Form.Label>Contest Start Date</Form.Label>
                    <div>
                    <Flatpickr 
                        data-enable-time 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        value={this.state.startDate}
                        onChange={date => { this.setState({ startDate: date[0] })}}
                    />
                    </div>
                </Form.Group>

                { this.state.contestType === 'building' &&
                <Form.Group controlId="submissionEndDate" as={Col}>
                    <Form.Label>Submission End Date</Form.Label>
                    <div>
                    <Flatpickr 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        
                        data-enable-time 
                        value={this.state.submissionEndDate}
                        onChange={date => { this.setState({ submissionEndDate: date[0] })}}
                    />
                    </div>
                </Form.Group>
                }

                <Form.Group controlId="votingEndDate" as={Col}>
                    <Form.Label>Contest End Date</Form.Label>
                    <div>
                    <Flatpickr 
                        data-enable-time 
                        options={{
                            dateFormat: 'm/d/Y h:i K',
                        }}
                        value={this.state.votingEndDate}
                        onChange={date => { this.setState({ votingEndDate: date[0] })}}
                    />
                    </div>
                </Form.Group>
                {!this.getDatesValid() && 
                    <Alert variant='danger'>
                        Invalid dates. Ensure Submssions end after today, Submission end is after contest start, and Submission End is before Voting End date.
                    </Alert>
                }
                {!this.getReasonableDates() && 
                    <Alert variant='danger'>
                        Contests must start within a week and must not run more than 4 weeks
                    </Alert>
                }
                </Form.Row>

                

                
                    <Form.Row>
                        { this.state.contestType !== 'speedrun' &&
                        <Form.Group controlId='displayTopScore' as={Col}>
                            <div className="middle-box" style={{width: '250px'}}>
                                <Form.Check 
                                    custom
                                    type={'checkbox'}
                                    id={`displayTopScore`}
                                    label={`Display Top Scores on submitted levels`}
                                    checked={this.state.displayTopScore}
                                    onChange={e => { this.setState({ displayTopScore: !this.state.displayTopScore })}}
                            />
                            </div>
                        </Form.Group>
                        }

                        { (this.state.contestType === 'speedrun' || this.state.displayTopScore) && <>
                            <Form.Group controlId='countCrowns' as={Col}>
                                <div className="middle-box" >
                                    <Form.Check 
                                        custom
                                        isInvalid={!this.getTopScoresValid()}
                                        checked={this.state.countCrowns}
                                        onChange={e => { this.setState({ countCrowns: !this.state.countCrowns  })}}
                                        type={'checkbox'}
                                        id={`countCrowns`}
                                        label={`Score Crowns`}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Speed run contests must either be for shoes, crowns or both
                                    </Form.Control.Feedback>
                                </div>
                                
                            </Form.Group>

                            <Form.Group controlId='countShoes' as={Col}>
                                <div className="middle-box">
                                    <Form.Check 
                                        custom
                                        isInvalid={!this.getTopScoresValid()}
                                        checked={this.state.countShoes}
                                        onChange={e => { this.setState({ countShoes: !this.state.countShoes })}}
                                        type={'checkbox'}
                                        id={`countShoes`}
                                        label={`Score Shoes`}
                                />
                                </div>
                            </Form.Group>
                            </>
                        }
                    </Form.Row>
                

                { this.state.contestType === 'building' &&
                <>
                    <Form.Row>

                     <Form.Group controlId="maxVotePerUser" as={Col}>
                        <Form.Label>Max Votes Per User</Form.Label>
                        <Form.Control type="number" placeholder="1-99" 
                                        required
                                        min={1}
                                        max={99}
                                        value={this.state.maxVotePerUser} 
                                        onChange={e => { this.setState({ maxVotePerUser: e.target.value })}} />
                        <Form.Control.Feedback type="invalid">
                            Users can have between 1 and 99 votes
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId='canVoteForSelf' as={Col}>
                        <div className="middle-box">
                            <Form.Check 
                                custom
                                type={'checkbox'}
                                id={`canVoteForSelf`}
                                label={`Allow self votes`}
                                checked={this.state.canVoteForSelf}
                                onChange={e => { this.setState({ canVoteForSelf: !this.state.canVoteForSelf })}}
                        />
                        </div>
                    </Form.Group>

                    <Form.Group controlId='allowPreviousLevels' as={Col}>
                        <div className="middle-box">
                            <Form.Check 
                                custom
                                type={'checkbox'}
                                id={`allowPreviousLevels`}
                                label={`Allow levels created before contest began`}
                                checked={this.state.allowPreviousLevels}
                                onChange={e => { this.setState({ allowPreviousLevels: !this.state.allowPreviousLevels })}}
                        />
                        </div>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group controlId='requireDailyBuild' as={Col}>
                        <div className="middle-box">
                            <Form.Check 
                                
                                custom
                                type={'checkbox'}
                                id={`requireDailyBuild`}
                                label={`Require levels be Daily Build levels`}
                                checked={this.state.requireDailyBuild}
                                onChange={e => { this.setState({ requireDailyBuild: !this.state.requireDailyBuild })}}
                        />
                        </div>
                        
                    </Form.Group>

                    <Form.Group controlId='requireLevelInTower' as={Col}>
                        <div className="middle-box">
                            <Form.Check 
                                custom
                                type={'checkbox'}
                                id={`requireLevelInTower`}
                                label={`Require submission to be in the tower`}
                                checked={this.state.requireLevelInTower}
                                onChange={e => { this.setState({ requireLevelInTower: !this.state.requireLevelInTower })}}
                        />
                        </div>
                    
                    </Form.Group>
                </Form.Row>
                </>
                }

                { this.state.contestType === 'speedrun' &&
                <>
                    <h4>Contest Levels</h4>
                    
                    <div className="row">
                        <div className='col-md-4'><h3>Lookup Code</h3></div>
                        <div className='col-md-6'><h3>Level Details</h3></div>
                        <div className='col-md-2'></div>
                    </div>

                    {
                        this.state.contestLevels.map( (lookupCode, index)  => {
                                        return (<div className={"row levelRow " + (index % 2 == 0 ? '' : 'light-grey')} key={index}>
                                                    <div className='col-md-4'>
                                                        <Form.Group controlId={`level_${index}`}>
                                                            <Form.Control type="text" placeholder="Enter lookup code" 
                                                                            isInvalid={this.isLevelInvalid(lookupCode)}
                                                                            isValid={_.findIndex(this.state.levelDetails, x => x.name === lookupCode) >= 0}
                                                                            className={'form-control ' + (lookupCode.length === 0 || lookupCode.length === 7 ? '' : 'invalid')}
                                                                            value={lookupCode}
                                                                            onChange={e => {
                                                                                let levels = _.cloneDeep(this.state.contestLevels);
                
                                                                                let newVal = e.target.value;
                                                                                newVal = newVal.substring(0, Math.min(newVal.length, 7))
                                                                                levels[index] = newVal;
                
                                                                                if(index === this.state.contestLevels.length-1 && 
                                                                                    this.state.contestLevels.length < MAX_LEVELS_PER_CONTEST) {
                                                                                    levels.push('');
                                                                                }
                                                                                this.setState({ contestLevels: levels, levelsValid: false, levelDetails: null });
                                                                            }} />
                                                        </Form.Group>                                 
                                                    </div>
                                                    <div className='col-md-6'>
                                                        {this.getLevelNameFromId(lookupCode)}
                                                    </div>
                                                    <div className='col-md-2'>
                                                    {index > 0 && <i className="fas fa-trash"  onClick={() => {
                                                        let levels = _.cloneDeep(this.state.contestLevels);
                                                        levels.splice(index, 1);
                                                        this.setState({ contestLevels: levels});
                                                    }}></i>}</div>
                                                </div>);
                                })
                    }
                    
                </>
                }

                {this.state.speedrunLevelErrors && 
                    <Alert variant='danger'>
                        {this.state.speedrunLevelErrors}
                    </Alert>
                }

                
                { (this.state.contestType !== 'speedrun' || !!this.state.levelsValid) &&
                    <button 
                            type='submit'
                            className='b1 gbtn pull-right'
                        >
                        Create Contest
                    </button>
                }

                { this.state.contestType === 'speedrun' && !this.state.levelsValid &&

                     <button 
                            type='button'
                            onClick={this.checkLevels}
                            className='b2 gbtn pull-right'
                            disabled={this.state.loadingLevels}
                        >
                        {this.state.loadingLevels ? <i className='fas fa-spinner fa-spin'></i> : 'Validate Levels'}
                    </button>

                }
                
            </Form>
                            
                

                 
            </div>
        </div>);
    }

}

export default ContestCreator;