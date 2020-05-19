import React from 'react';
import * as _ from 'lodash';
function RaceEntrants (props) {
    let getPosition = (position) => {
        switch(position) {
            case 1:
                return <><span className='first-race'>1</span><span className='first-race-text'>st</span></>;
            case 2:
                return <><span className='second-race'>2</span><span className='second-race-text'>nd</span></>;
            case 3:
                return <><span className='third-race'>3</span><span className='third-race-text'>rd</span></>;
            default:
                return <><span className='other-race'>{position}</span><span className='other-race-text'>th</span></>;
        }
    }

    if(!props.entrants || props.entrants.length === 0) {
        return <h1 style={{ width: '100%', textAlign: 'center' }}>No Entrants Yet</h1>
    }


    let formatSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let s = seconds % 60;

        if(minutes > 0){
            return `${minutes}:${s.toFixed(2).padStart(5, '0')}`
        } else {
            return s.toFixed(2);
        }
    }
    
    let entrants = _.orderBy(props.entrants, (x => x.currentBestTime));

    // entrants = [{
    //     currentBestTime: 33.85,
    //     rumpusAlias: 'RetrophileTv',
    //     golds: 1,
    //     silvers: 4,
    //     bronzes: 2
    // },
    // {
    //     currentBestTime: 44.5,
    //     rumpusAlias: 'Spekio',
    //     golds: 2,
    //     bronzes: 2
    // },
    // {
    //     currentBestTime: 60,
    //     rumpusAlias: 'Cprice',
    //     bronzes: 4
    // },
    // {
    //     currentBestTime: 84.26,
    //     rumpusAlias: 'Levelheader',
    //     silvers: 3
    // },
    // {
    //     currentBestTime: 148.55,
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
            <div className='col-md-2 col-3 th'>Position</div>
             <div className='col-md-1 d-none d-md-block th'></div> 
            <div className='col-md-4 col-6 th'>Player</div>
            <div className='col-md-2 col-3 th'>Best Time</div>
            <div className='col-md-1 d-none d-md-block th'><span role='img' aria-label='gold-medals'>🥇</span></div>
            <div className='col-md-1 d-none d-md-block th'><span role='img' aria-label='silver-medals'>🥈</span></div>
            <div className='col-md-1 d-none d-md-block th'><span role='img' aria-label='bronze-medals'>🥉</span></div>
        </div>
        {entrants.map((x, i) => {
            return (
            <div className='row tr justify-content-center align-items-center' key={i}>
                <div className='col-md-2 col-3 td center'>{!!x.currentBestTime ? getPosition(x.position) : ''}</div>
               <div className='col-md-1 d-none d-md-block td center'><img height='64' src={`https://img.bscotch.net/fit-in/64x64/avatars/${x.avatarId || 'bureau-employee'}.webp`} /></div>
                <div className='col-md-4 col-5 td'>{x.rumpusAlias || x.discordDisplayName}</div>
                <div className='col-md-2 col-3 td' style={{ textAlign:'right' }}>{(x.currentBestTime !== undefined && x.currentBestTime !== null) ? `${formatSeconds(x.currentBestTime)}` : ''}</div>
                <div className='col-md-1 d-none d-md-block td medal-col'><div className='medal-text'>{x.golds}</div></div>
                <div className='col-md-1 d-none d-md-block td medal-col-2'><div className='medal-text'>{x.silvers}</div></div>
                <div className='col-md-1 d-none d-md-block td medal-col'><div className='medal-text'>{x.bronzes}</div></div>
            </div>);
    })}
    </>
    );
}


export default RaceEntrants;