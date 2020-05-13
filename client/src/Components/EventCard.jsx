import React from 'react';
import * as moment from 'moment';
import ReactMarkdown from 'react-markdown'
import { NavLink } from 'react-router-dom';


function EventCard(props) {

    let eventOver = props.endDate && new Date(props.endDate) < new Date();

    return <div className="card"> 
            <div className={"card-header-" + props.eventType}>
                <div className="card-text">

                    <NavLink exact to={`/${props.eventType}/${props._id}`}><h2>{props.name}</h2></NavLink>

                    {props.startDate && <h3> {moment(props.startDate).format('MMM Do')} - {moment(props.endDate).format('MMM Do')}</h3>}
                    <h5><ReactMarkdown source={props.subtitle} /></h5>
                
                </div>
            </div>      
            { props.eventType === 'contest' &&
                <div className="card-body">
                    <><NavLink exact to={`/${props.eventType}/${props._id}`} 
                                className="NavButton"
                                activeClassName="activeRoute">
                                <button className='b1' >{ eventOver ? 'View Results' : 'Contest Info'}</button>
                    </NavLink> 
                    <NavLink exact to={`/submissions/${props._id}`} 
                                className="NavButton"
                                activeClassName="activeRoute">
                                <button className='b2' >View Entries</button>
                    </NavLink> </>
                    
                </div>      
            }
            { props.eventType === 'season' &&
                <div className="card-body">
                
                <NavLink exact to={`/${props.eventType}/${props._id}`} 
                            className="NavButton"
                            activeClassName="activeRoute">
                            <button className='b1' >{ eventOver ? 'View Results' : 'View Leaderboard'}</button>
                </NavLink> 
                    
            
                <NavLink exact to={`/seasonInfo/${props._id}`} 
                                className="NavButton"
                                activeClassName="activeRoute">
                                <button className='b2' >Season Info</button>
                </NavLink>
                </div>      
            }
            { props.eventType === 'race' &&
                <div className="card-body">
                
                <NavLink exact to={`/race`} 
                            className="NavButton"
                            activeClassName="activeRoute">
                            <button className='b1' >View Race</button>
                </NavLink> 
                    
                </div>      
            }
        </div>
}



export default EventCard;