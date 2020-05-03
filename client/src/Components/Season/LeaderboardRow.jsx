import React, { Component } from 'react';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';
import { NotificationManager } from 'react-notifications';
import { Form } from 'react-bootstrap'
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';

class LeaderboardRow extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showScores: false,
            scores: null,
        }

    }

    async getUserScores() {
        try {
            let resp = await axios.post(endPoints.GET_USER_SCORES, {
                userId: this.props.player.userId,
                seasonId: this.props.seasonId,
            });

            if(resp.data.success) {
                this.setState({ scores: resp.data.data });
            } else {
                NotificationManager.error('Something went wrong!');
            }
        } catch(err) {
            NotificationManager.error('Something went wrong!');
        }
    }

    getPosition = (position) => {
        switch(position) {
            case 1:
                return <h1 className='first first-pad'>1st</h1>;
            case 2:
                return <h2 className='second second-pad'>2nd</h2>;
            case 3:
                return <h4 className='third third-pad'>3rd</h4>;
            default:
                return <h5 className='other other-pad'>{position}th</h5>;
        }
    }

    formatSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let s = seconds % 60;

        if(minutes > 0){
            return `${minutes}:${s.toFixed(2).padStart(5, '0')}`
        } else {
            return s.toFixed(2);
        }
    }

    getMedal = (levelInfo, score) => {
        if(levelInfo.diamondValue > score) {
            return <span style={{ paddingLeft: '12px'}} role='img' aria-label='diamond'>💎</span>
        } else if (levelInfo.platinumValue > score) {
            return <span style={{ paddingLeft: '12px'}} role='img' aria-label='platinum'><img src='/assets/Platinum.png' heigh='16' width='16' alt='Platinum'/></span>
        } else if (levelInfo.goldValue > score) {
            return <span style={{ paddingLeft: '12px'}} role='img' aria-label='gold'>🥇</span>
        } else if (levelInfo.silverValue > score) {
            return <span style={{ paddingLeft: '12px'}} role='img' aria-label='silver'>🥈</span>
        } else if (levelInfo.bronzeValue > score) {
            return <span style={{ paddingLeft: '12px'}} role='img' aria-label='bronze'>🥉</span>
        } else {
            return <span></span>
        }
    }

    render(){
       let player = this.props.player;

        let getScores = (scores) => {
            if(scores.length > 0) {
                return scores.map((x, i) => {
                    let level = _.find(this.props.levelInfo, y => y.lookupCode === x.levelLookupCode);

                    return <tr key={i} >
                            <td></td>
                            <td colSpan='1'>{level && level.levelName}</td>
                            <td colSpan='1'><a href={`https://lvlhd.co/+${x.levelLookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{x.levelLookupCode}</a></td>
                            <td colSpan='1'>{this.formatSeconds(x.value)}</td>
                            <td colSpan='6'>{level && this.getMedal(level, x.value)}</td>
                        </tr>});
            } else {
                return <tr>
                            <td colSpan='9' align="center">
                                No Scores
                            </td>
                        </tr>
            }
        }

        return (<>
                <tr className={"submission-row " + ((player.userId === this.props.loggedInUserId)  ? "player-row" : "")} 
                    onClick={() => { 
                        this.setState({ showScores: !this.state.showScores }, () => {
                            if(!this.state.scores && this.state.showScores){
                                this.getUserScores();
                            }
                        }); 
                        
                    }}>
                    <td style={{paddingTop: '0' }}>{this.getPosition(this.props.index + 1)}</td>
                    <td>
                    
                    <NavLink exact to={`/profile/${player.userId}`} 
                                className="PlayerProfileLink"
                                activeClassName="activeRoute">
                                {player.rumpusAlias}
                    </NavLink> 
                      {player.awards && player.awards.map(award => <span style={{ cursor: 'default'}} role='img'>{award}</span>)} </td>
                    <td align='center' className='large'>{player.diamonds}</td>
                    <td align='center' className='large'>{player.platinums}</td>
                    <td align='center' className='large'>{player.golds}</td>
                    <td align='center' className='large'>{player.silvers}</td>
                    <td align='center' className='large'>{player.bronzes}</td>
                    <td align='center'>{player.totalPoints}</td>
                    <td align='center'>{player.totalTime}</td>
                    { this.props.admin && !this.props.seasonOver && <td onClick={(e) => {
                                                e.stopPropagation(); 
                                                e.preventDefault();
                                            }}>
                        <Form.Control as="select" 
                                value={player.league} 
                                onChange={e => { 
                                    this.props.setLeague(player, e.target.value); }}>
                                <option value='0'>Mega</option>
                                <option value='1'>Turbo</option>
                                <option value='2'>Jem</option>
                                {/* <option value='3'>Apprentice</option> */}
                        </Form.Control>
                    </td> }
                </tr>
                { this.state.showScores &&
                    <>
                    <tr>
                        <th></th>
                        <th colSpan='1'>Level</th>
                        <th colSpan='1'>Lookup</th>
                        <th colSpan='1'>Time</th>
                        <th colSpan='5'>Award</th>
                    </tr>
                    {
                        this.state.scores ? 
                            getScores(this.state.scores) : 
                            <tr>
                                <td colSpan='9' align="center">
                                    <i className='fas fa-spinner fa-spin fa-3x'></i>
                                </td>
                            </tr>
                    }
                    </>
                }
                </>
                );
    }
}

export default LeaderboardRow;