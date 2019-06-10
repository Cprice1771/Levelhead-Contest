import React, { Component } from 'react';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'
import { NavLink } from 'react-router-dom';


function ContestCard(props) {
    return <div className="card"> 
            <div className={"card-header-" + props.contestType}>
                <div className="card-text">
                    <NavLink exact to={`/contest/${props._id}`}><h2>{props.name}</h2></NavLink>
                    <h3> {moment(props.startDate).format('MMM Do')} - {moment(props.votingEndDate).format('MMM Do')}</h3>

                    <h5><ReactMarkdown source={props.theme} /></h5>
                
                </div>
            </div>      
            <div className="card-body">
                <NavLink exact to={`/contest/${props._id}`} 
                            className="NavButton"
                            activeClassName="activeRoute">
                            <button className='b1' >Contest Info</button>
                </NavLink> 
                <NavLink exact to={`/submissions/${props._id}`} 
                            className="NavButton"
                            activeClassName="activeRoute">
                            <button className='b2' >View Entries</button>
                </NavLink> 
            </div>      
        </div>
}



export default ContestCard;