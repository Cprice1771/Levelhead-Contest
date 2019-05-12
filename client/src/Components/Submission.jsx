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
            {(props.showVotes || true) &&<td>{submision.votes}</td>}
            <td>{(true || props.canVote) &&
                <i className={"" + (props.hasVotedFor ? 'fas fa-arrow-alt-circle-up' : 'fas fa-arrow-alt-circle-down')} onClick={() => {
                    
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