import React from 'react';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'
import { NavLink } from 'react-router-dom';


function EventCard(props) {
    return <div className="card"> 
            <div className={"card-header-" + props.eventType}>
                <div className="card-text">
                    <NavLink exact to={`/contest/${props._id}`}><h2>{props.name}</h2></NavLink>
                    <h3> {moment(props.startDate).format('MMM Do')} - {moment(props.endDate).format('MMM Do')}</h3>

                    <h5><ReactMarkdown source={props.subtitle} /></h5>
                
                </div>
            </div>      
            { props.eventType === 'contest' &&
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
            }
            { props.eventType === 'season' &&
                <div className="card-body">
                    <NavLink exact to={`/season/${props._id}`} 
                                className="NavButton"
                                activeClassName="activeRoute">
                                <button className='b1' >View Leaderboard</button>
                    </NavLink> 
                </div>      
            }
        </div>
}



export default EventCard;