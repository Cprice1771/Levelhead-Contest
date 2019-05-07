import React, { Component } from 'react';

import * as moment from 'moment'

function Submission (props) {

    let submision = props.submission;

    return (
    <div className="submission">
        <div className="row">
            <div className="col-md-2"><a href={`https://lvlhd.co/+${submision.lookupCode}`} target="_blank" className="levelLink">{submision.lookupCode}</a></div>
            <div className="col-md-2">{submision.rumpusUserName}</div>
            <div className="col-md-2">{submision.levelMetaData.map.Title}</div>
            <div className="col-md-2">{moment(submision.levelMetaData.createdAt).format("MM/DD/YYYY")}</div>
            <div className="col-md-2">{submision.votes.length}</div>
            <div className="col-md-2"><i className="fas fa-arrow-up" onClick={() => {
                props.vote(submision._id);
            }}></i></div>
        </div>
    </div>);

}

export default Submission;