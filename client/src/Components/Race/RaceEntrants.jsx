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
    //     currentBestTime: 146,
    //     rumpusAlias: 'Cprice'
    // },
    // {
    //     currentBestTime: 146,
    //     rumpusAlias: 'Levelheader'
    // },
    // {
    //     currentBestTime: 147,
    //     rumpusAlias: 'TripleB'
    // },
    // {
    //     rumpusAlias: 'QuantumAnomly'
    // }]

    let assignPlace = (results, column) => {
        if(results.length === 0) {
            return;
        }

        let currentPlace = 1;

        results[0].position = currentPlace;
        for(var i = 1; i < results.length; i++) {
            if(results[i][column] > results[i-1][column]) {
                currentPlace = i+1;
            }

            results[i].position = currentPlace;
        }

        return results;
    }

    entrants = assignPlace(entrants, 'currentBestTime');    

    return (
        
        <>
        <div className='row rh'>
            <div className='col-md-2 th'>Position</div>
            <div className='col-md-5 th'>Player</div>
            <div className='col-md-3 th'>Best Time</div>
            <div className='col-md-2 th'>Wins</div>
        </div>
        {entrants.map((x, i) => {
            return (
            <div className='row tr' key={i}>
                <div className='col-md-2 td'><div className='entrant-text'>{!!x.currentBestTime ? getPosition(x.position) : ''}</div></div>
                <div className='col-md-5 td'><div className='entrant-text'>{x.rumpusAlias || x.discordDisplayName}</div></div>
                <div className='col-md-3 td'><div className='entrant-text'>{(x.currentBestTime !== undefined && x.currentBestTime !== null) ? `${x.currentBestTime} s` : ''}</div></div>
            <div className='col-md-2 td'><div className='entrant-text'>{x.wins}</div></div>
            </div>);
    })}
    </>
    );
}


export default RaceEntrants;