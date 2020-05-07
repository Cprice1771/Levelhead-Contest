import React from 'react';

function RaceEntrants (props) {
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

    if(!props.entrants || props.entrants.length === 0) {
        return <h1 style={{ width: '100%', textAlign: 'center' }}>No Entrants Yet</h1>
    }

    return (
    
    <>
    <div className='row rh'>
        <div className='col-md-2 th'>Position</div>
        <div className='col-md-6 th'>Player</div>
        <div className='col-md-4 th'>Time</div>
    </div>
    {props.entrants.map((x, i) => {
        

        return (
        <div className='row tr' key={i}>
            <div className='col-md-2 td'>{getPosition(i + 1)}</div>
            <div className='col-md-6 td'><div className='center-text'>{x.rumpusAlias}</div></div>
            <div className='col-md-4 td'><div className='center-text'>{x.currentBestTime}</div></div>
        </div>);
    })}
    </>
    );
}


export default RaceEntrants;