import React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

function Leaderboard (props) {
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

    let userId = props.userId;
    let orderedPlayers = _.orderBy(props.entries, ['totalPoints', 'diamonds', 'golds', 'silvers', 'bronzes'], ['desc', 'desc', 'desc', 'desc', 'desc'])

    let getRow = (player, index) => {
        return ( <tr className={"submission-row " + ((player.userId === userId)  ? "player-row" : "")}>
                    <td>{getPosition(index + 1)}</td>
                    <td>{player.rumpusAlias}</td>
                    <td align='center'>{player.diamonds}</td>
                    <td align='center'>{player.golds}</td>
                    <td align='center'>{player.silvers}</td>
                    <td align='center'>{player.bronzes}</td>
                    <td align='center'>{player.totalPoints}</td>
                </tr>)
                };

    let megaJem = orderedPlayers.filter(x => x.league === '0').map(getRow);
    let turboJem = orderedPlayers.filter(x => x.league === '1').map(getRow);
    let jem = orderedPlayers.filter(x => x.league === '2').map(getRow);
    let apprentice = orderedPlayers.filter(x => x.league === '3').map(getRow);

    return (
        <>
        
        <div className='row'>
            <div className='col-8'>
            <h1>Leaderboard</h1>
            </div>
            <div className='col-4'>
                <div style={{  position: 'absolute',
                                bottom: 0,
                                left: 0, }}>Last updated ({moment(props.lastUpdate).format('MM/DD/YYYY hh:mm A')})</div>
            </div>
        </div>
        <div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th align='center'>Diamonds</th>
                        <th align='center'>Golds</th>
                        <th align='center'>Silvers</th>
                        <th align='center'>Bronzes</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th className='leaderboard-header megajem' colSpan='7' >Mega Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {megaJem}
                </tbody>
                <thead>
                    <tr>
                    <th className='leaderboard-header turbojem' colSpan='7'>Turbo Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {turboJem}
                </tbody>
                <thead>
                    <tr>
                        <th className='leaderboard-header jem' colSpan='7'>Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {jem}
                </tbody>
                <thead>
                    <tr>
                        <th className='leaderboard-header apprentice' colSpan='7'>Apprentice League</th>
                    </tr>
                </thead>
                <tbody>
                {apprentice}
                </tbody>
            </table>
        </div>
        </>
    )
}

export default Leaderboard;