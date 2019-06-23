import React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

function Leaderboard (props) {


    let formatSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let s = seconds % 60;

        if(minutes > 0){
            return `${minutes}:${s.toFixed(2).padStart(5, '0')}`
        } else {
            return s.toFixed(2);
        }
    }

    let orderedLevels = _.orderBy(props.levels, ['startDate'], ['asc']);
    if(!props.admin) {
        orderedLevels = orderedLevels.filter(x => new Date(x.startDate) < new Date());
    }

    let levels = orderedLevels.map((lvl) => {

        let scheduled = new Date(lvl.startDate) > new Date();
        return ( <tr className={(scheduled ? 'scheduled-row' : 'submission-row')} key={lvl.lookupCode}>
                    <td>{lvl.levelName} {scheduled && <div> {`(Scheduled ${moment(lvl.startDate).format('MM/DD/YYYY hh:mm A')})`}</div>}
                        {lvl.legendValue && <span style={{ cursor: 'default'}} title={`Time: ${lvl.legendValue}`}>✳️</span>}
                    </td>
                    <td>{lvl.creatorAlias}</td>
                    <td><a href={`https://lvlhd.co/+${lvl.lookupCode}`} target="_blank" rel="noopener noreferrer" className="levelLink">{lvl.lookupCode}</a></td>
                    <td>{formatSeconds(lvl.diamondValue)}</td>
                    <td>{formatSeconds(lvl.goldValue)}</td>
                    <td>{formatSeconds(lvl.silverValue)}</td>
                    <td>{formatSeconds(lvl.bronzeValue)}</td>
                    <td>{ lvl.record &&  <><div>{lvl.record.alias}</div> <div>{formatSeconds(lvl.record.value)}</div></>} </td>
                    {props.canBookmark && <td><i className='fas fa-bookmark fa-2x' style={{color: '#7D6B91', cursor: 'pointer'}} onClick={() => { props.bookmark([lvl.lookupCode])}}> </i></td>}
                </tr>)
                })

    return (
        <>
        <div className='row'>
            <div className='col-md-10'><h1>Challenges</h1></div>
            <div className='col-md-2'>
            { props.canBookmark && <button 
                onClick={props.bookmarkAll}
                 style={{
                    marginRight: '10px',
                    borderRadius: '5px',
                    border: 'none',
                    paddingTop: '10px',
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    bottom: 0
                }}>Bookmark All</button>}
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '10px',
                }}>
                    { props.admin && !props.seasonOver && <i className="fas fa-plus add-level"  onClick={props.addLevel}></i> }
                </div>
            </div>
        </div>
        <div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        
                        <th>Title</th>
                        <th>Creator</th>
                        <th>Lookup</th>
                        <th>Diamond</th>
                        <th>Gold</th>
                        <th>Silver</th>
                        <th>Bronze</th>
                        <th>Current WR</th>
                        {props.canBookmark && <th></th> }
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