import { endPoints } from '../../Constants/Endpoints';
import React, { Component } from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NotificationManager } from 'react-notifications';
import axios from 'axios'
class LevelBoardRow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showScores: false,
            scores: null,
        }

        this.getLevelScores = this.getLevelScores.bind(this);
        this.formatSeconds = this.formatSeconds.bind(this);
    }

    async getLevelScores() {
        try {
            let resp = await axios.post(endPoints.GET_LEVEL_SCORES, {
                levelId: this.props.lvl.lookupCode,
                seasonId: this.props.seasonId,
            });

            if(resp.data.success) {
                resp.data.data = _.orderBy(resp.data.data, ['value'], ['asc']);
                this.setState({ scores: resp.data.data });
            } else {
                NotificationManager.error('Failed getting level scores');
            }
        } catch(err) {
            NotificationManager.error(`Failed getting level scores ${err}`);
        }
    }

    formatSeconds(seconds) {
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
       let { lvl, scheduled } = this.props;

       let getScores = (scores) => {
        if(scores.length > 0) {
                return scores.map((x, i) => {
                    
                    let cols = this.props.canBookmark ? 7 : 6

                    return <tr key={i} >
                            <td className='smll'></td>
                            <td colSpan='1'>{x.rumpusAlias}</td>
                            <td colSpan='1'>{this.formatSeconds(x.value)}</td>
                            <td colSpan={`${cols}`}>{this.getMedal(this.props.lvl, x.value)}</td>
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
                <tr className={(scheduled ? 'scheduled-row' : 'submission-row')}
                
                onClick={() => { 
                    this.setState({ showScores: !this.state.showScores }, () => {
                        if(!this.state.scores && this.state.showScores){
                            this.getLevelScores();
                        }
                    }); 
                    
                }}
                >
                    <td>{lvl.levelName} {scheduled && <div> {`(Scheduled ${moment(lvl.startDate).format('MM/DD/YYYY hh:mm A')})`}</div>}
                        {lvl.bonusAward && <span style={{ cursor: 'default'}} title={`Time: ${lvl.bonusAward.awardValue}`} role='img' aria-label={`${lvl.bonusAward.awardName}`}>{lvl.bonusAward.awardIcon}</span>}
                    </td>
                    <td className='smll'>{lvl.creatorAlias}</td>
                    <td><a href={`https://lvlhd.co/+${lvl.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{lvl.lookupCode}</a></td>
                    <td className='smll'>{this.formatSeconds(lvl.diamondValue)}</td>
                    <td className='smll'>{this.formatSeconds(lvl.platinumValue)}</td>
                    <td className='smll'>{this.formatSeconds(lvl.goldValue)}</td>
                    <td className='smll'>{this.formatSeconds(lvl.silverValue)}</td>
                    <td className='smll'>{this.formatSeconds(lvl.bronzeValue)}</td>
                    <td>{ lvl.record &&  <><div>{lvl.record.alias}</div> <div>{this.formatSeconds(lvl.record.value)}</div></>} </td>
                    {this.props.canBookmark && <td><i className='fas fa-bookmark fa-2x' style={{color: '#7D6B91', cursor: 'pointer'}} onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.bookmark([lvl.lookupCode])}}> </i></td>}
                </tr>
                { this.state.showScores &&
                    <>
                    <tr>
                        <th className='smll'></th>
                        <th>User</th>
                        <th>Time</th>
                        <th colSpan={`${this.props.canBookmark ? 6 : 5}`}>Award</th>
                    </tr>
                    {
                        this.state.scores ? 
                            getScores(this.state.scores) : 
                            <tr>
                                <td colSpan='8' align="center">
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

export default LevelBoardRow;