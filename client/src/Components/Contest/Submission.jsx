import React from 'react';
import * as _ from 'lodash';
import { NavLink } from 'react-router-dom';
function Submission (props) {

    let submision = props.submission;
    console.log(submision);
    return (
        <tr className="submission-row">
            <td className='large'>
                <div className="checkbox-container">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={!!submision.played} onChange={e => { props.togglePlayed(submision._id)}}/>
                        <span className="checkbox-custom rectangular"></span>
                    </label>
                </div>
            </td>
            <td><a href={`https://lvlhd.co/+${submision.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{submision.lookupCode}</a></td>
            <td>
            
            <NavLink exact to={`/profile/${submision.submittedByUserId}`} 
                                className="levelLink"
                                activeClassName="activeRoute">
                                {submision.rumpusUserName}
                    </NavLink> 
            </td>
            <td>{submision.levelMetaData.title}</td>
            <td className='medium'>{submision.levelMetaData.stats.Attempts}</td>
            <td className='medium'>{submision.levelMetaData.stats.Attempts === 0 ? 0 : _.round(((submision.levelMetaData.stats.Successes / submision.levelMetaData.stats.Attempts) * 100), 2)}%</td>
            
            <td className='medium'>
                <div className="row"><div className='col-md-12'><span role='img' aria-label="Shoes">👟</span> {submision.levelMetaData.records.FastestTime[0].rumpusName}</div></div>
                <div className="row"><div className='col-md-12'><span role='img' aria-label="Crown">👑</span> {submision.levelMetaData.records.HighScore[0].rumpusName}</div></div>
            </td>
            
            {(props.showVotes) &&<td>{submision.votes}</td>}
            {props.canBookmark && <td><i className='fas fa-bookmark fa-2x' style={{color: '#7D6B91', cursor: 'pointer'}} onClick={() => { props.bookmark([submision.lookupCode])}}> </i></td>}
            {(props.canVote) &&<td>
                <i className={"fas fa-arrow-alt-circle-up " + (props.hasVotedFor ? 'fa-arrow-alt-circle-selected' : 'fa-arrow-alt-circle-delescted')} onClick={() => {
                    
                    if(props.hasVotedFor) {
                        props.unvote(submision._id);
                    } else {
                        props.vote(submision._id);
                    }
                }}></i>
            </td>}
        </tr>);

}

export default Submission;