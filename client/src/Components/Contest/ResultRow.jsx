import React from 'react';
import { NavLink } from 'react-router-dom';

function ResultRow (props) {
    let getPosition = (position) => {
        switch(position) {
            case 1:
                return <h1 className='first'>1st</h1>;
            case 2:
                return <h2 className='second'>2nd</h2>;
            case 3:
                return <h4 className='third'>3rd</h4>;
            default:
                return <h5 className='other'>{position}th</h5>;
        }
    }

    return (
        <tr className="submission-row">
            <td>{getPosition(props.position)}</td>
            <td>
            <NavLink exact to={`/profile/${props.submittedByUserId}`} 
                                className="levelLink"
                                activeClassName="activeRoute">
                                {props.rumpusUserName}
                    </NavLink> 
            </td>
            <td>{props.title}</td>
            <td>{props.votes}</td>
        </tr>);

}

export default ResultRow;