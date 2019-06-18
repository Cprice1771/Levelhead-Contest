import React from 'react';
import * as _ from 'lodash';

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

    let orderedPlayers = _.orderBy(props.entries, ['totalPoints', 'diamonds', 'golds', 'silvers', 'bronzes'], ['desc', 'desc', 'desc', 'desc', 'desc'])

    let megaJem = orderedPlayers.filter(x => x.league === '0').map((player, index) => {
        return ( <tr className="submission-row">
                    <td>{getPosition(index + 1)}</td>
                    <td>{player.rumpusAlias}</td>
                    <td>{player.diamonds}</td>
                    <td>{player.golds}</td>
                    <td>{player.silvers}</td>
                    <td>{player.bronzes}</td>
                    <td>{player.totalPoints}</td>
                </tr>)
                });
    
    let turboJem = orderedPlayers.filter(x => x.league === '1').map((player, index) => {
        return ( <tr className="submission-row">
                    <td>{getPosition(index + 1)}</td>
                    <td>{player.rumpusAlias}</td>
                    <td>{player.diamonds}</td>
                    <td>{player.golds}</td>
                    <td>{player.silvers}</td>
                    <td>{player.bronzes}</td>
                    <td>{player.totalPoints}</td>
                </tr>)
                });
    let jem = orderedPlayers.filter(x => x.league === '2').map((player, index) => {
        return ( <tr className="submission-row">
                    <td>{getPosition(index + 1)}</td>
                    <td>{player.rumpusAlias}</td>
                    <td>{player.diamonds}</td>
                    <td>{player.golds}</td>
                    <td>{player.silvers}</td>
                    <td>{player.bronzes}</td>
                    <td>{player.totalPoints}</td>
                </tr>)
                });

    let apprentice = orderedPlayers.filter(x => x.league === '3').map((player, index) => {
        return ( <tr className="submission-row">
                    <td>{getPosition(index + 1)}</td>
                    <td>{player.rumpusAlias}</td>
                    <td>{player.diamonds}</td>
                    <td>{player.golds}</td>
                    <td>{player.silvers}</td>
                    <td>{player.bronzes}</td>
                    <td>{player.totalPoints}</td>
                </tr>)
                });

    return (
        <>
        <h1>Leaderboard</h1>
        <div className="submission-container" >
            <table className="table submission-header table-striped">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Diamond Medals</th>
                        <th>Gold Medals</th>
                        <th>Silver Medals</th>
                        <th>Bronze Medals</th>
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