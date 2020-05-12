import React from 'react';
import * as _ from 'lodash';
function RaceEntrants (props) {
    let getPosition = (position) => {
        switch(position) {
            case 1:
                return <span className='first-race'>1st</span>;
            case 2:
                return <span className='second-race'>2nd</span>;
            case 3:
                return <span className='third-race'>3rd</span>;
            default:
                return <span className='other-race'>{position}th</span>;
        }
    }

    if(!props.entrants || props.entrants.length === 0) {
        return <h1 style={{ width: '100%', textAlign: 'center' }}>No Entrants Yet</h1>
    }

    let entrants = _.sortBy(props.entrants, (x => x.currentBestTime));

    // entrants = [{
    //     currentBestTime: 145,
    //     rumpusAlias: 'RetrophileTv'
    // },
    // {
    //     currentBestTime: 145,
    //     rumpusAlias: 'Spekio'
    // },
    // {
    //     currentBestTime: 145,
    //     rumpusAlias: 'Cprice'
    // },
    // {
    //     currentBestTime: 145,
    //     rumpusAlias: 'Levelheader'
    // },
    // {
    //     currentBestTime: 145,
    //     rumpusAlias: 'TripleB'
    // },
    // {
    //     rumpusAlias: 'QuantumAnomly'
    // }]

    return (
    
    <>
    <div className='row rh'>
        <div className='col-md-2 th'>Position</div>
        <div className='col-md-6 th'>Player</div>
        <div className='col-md-4 th'>Best Time</div>
    </div>
    {entrants.map((x, i) => {
        

        return (
        <div className='row tr' key={i}>
            <div className='col-md-2 td'><div className='entrant-text'>{!!x.currentBestTime ? getPosition(i + 1) : ''}</div></div>
            <div className='col-md-6 td'><div className='entrant-text'>{x.rumpusAlias}</div></div>
            <div className='col-md-4 td'><div className='entrant-text'>{x.currentBestTime !== null ? `${x.currentBestTime} s` : ''}</div></div>
        </div>);
    })}
    </>
    );
}


export default RaceEntrants;