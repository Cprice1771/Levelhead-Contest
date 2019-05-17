import React from 'react';
import * as _ from 'lodash';

function ScoreRow (props) {


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
            <td>{getPosition(props.score.position)}</td>
            <td>{props.score.rumpusName}</td>
            <td>{props.score.fastestTimes}</td>
            <td>{props.score.highScores}</td>
            <td>{props.score.total}</td>
        </tr>);

}

export default ScoreRow;