import React from 'react';
import * as _ from 'lodash';

function Submission (props) {

    let submision = props.submission;
    
    return (
        <tr className="submission-row">
            <td><a href={`https://lvlhd.co/+${submision.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{submision.lookupCode}</a></td>
            <td>{submision.rumpusUserName}</td>
            <td>{submision.levelMetaData.map.Title}</td>
            <td>{submision.levelMetaData.stats.Attempts === 0 ? 0 : _.round(((submision.levelMetaData.stats.Successes / submision.levelMetaData.stats.Attempts) * 100), 2)}%</td>
            <td>{submision.levelMetaData.stats.Attempts}</td>
            {(props.showVotes) &&<td>{submision.votes}</td>}
            <td>{(props.canVote) &&
                <i className={"fas fa-arrow-alt-circle-up " + (props.hasVotedFor ? 'fa-arrow-alt-circle-selected' : 'fa-arrow-alt-circle-delescted')} onClick={() => {
                    
                    if(props.hasVotedFor) {
                        props.unvote(submision._id);
                    } else {
                        props.vote(submision._id);
                    }
                }}></i>
            }</td>
        </tr>);

}

export default Submission;