import React from 'react';
import * as _ from 'lodash';

function Leaderboard (props) {


    let formatSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let s = seconds % 60;

        if(minutes > 0){
            return `${minutes}:${s.toFixed(2)}`
        } else {
            return s.toFixed(2);
        }
    }

    let orderedLevels = _.orderBy(props.levels, ['startDate'], ['asc']).filter(x => new Date(x.startDate) < new Date());

    let levels = orderedLevels.map((lvl) => {
        return ( <tr className="submission-row">
                    <td>{lvl.levelName}</td>
                    <td>{lvl.creatorAlias}</td>
                    <td><a href={`https://lvlhd.co/+${lvl.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{lvl.lookupCode}</a></td>
                    <td>{formatSeconds(lvl.diamondValue)}</td>
                    <td>{formatSeconds(lvl.goldValue)}</td>
                    <td>{formatSeconds(lvl.silverValue)}</td>
                    <td>{formatSeconds(lvl.bronzeValue)}</td>
                </tr>)
                })

    return (
        <>
        <div className='row'>
            <div className='col-md-10'><h1>Challenges</h1></div>
            <div className='col-md-2'>
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '10px',
                }}>
                    <i className="fas fa-plus add-level"  onClick={props.addLevel}></i>
                </div>
            </div>
        </div>
        <div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        
                        <th>Title</th>
                        <th>Creator</th>
                        <th>Lookup Code</th>
                        <th>Diamond Time</th>
                        <th>Gold Time</th>
                        <th>Silver Time</th>
                        <th>Bronze Time</th>
                    </tr>
                </thead>
                <tbody>
                {levels}
                </tbody>
            </table>
        </div>
        </>
    )
}

export default Leaderboard;