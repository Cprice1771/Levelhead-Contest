import React from 'react';
import * as _ from 'lodash';

function Submission (props) {

    let submision = props.submission;
    
    return (
    <div className="submission">
        <div className="row">
            <div className="col-md-2"><a href={`https://lvlhd.co/+${submision.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{submision.lookupCode}</a></div>
            <div className="col-md-2">{submision.rumpusUserName}</div>
            <div className="col-md-3">{submision.levelMetaData.map.Title}</div>
            <div className="col-md-1">{submision.levelMetaData.stats.Attempts === 0 ? 0 : _.round(((submision.levelMetaData.stats.Successes / submision.levelMetaData.stats.Attempts) * 100), 2)}%</div>
            <div className="col-md-1">{submision.levelMetaData.stats.Attempts}</div>
            
            {(props.showVotes || true) &&<div className="col-md-2"> {submision.votes}</div>}
            <div className="col-md-1">
            {(true || props.canVote) &&
                <i className={"fas fa-arrow-up " + (props.hasVotedFor ? 'selected-arrow' : '')} onClick={() => {
                    
                    if(props.hasVotedFor) {
                        props.unvote(submision._id);
                    } else {
                        props.vote(submision._id);
                    }
                }}></i>
            }
            </div>
        </div>
    </div>);

}

export default Submission;