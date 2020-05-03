import React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

import LeaderboardRow from './LeaderboardRow';

function Leaderboard (props) {
    let orderedPlayers = _.orderBy(props.entries, ['totalPoints', 'diamonds', 'platinums', 'golds', 'silvers', 'bronzes', 'totalTime'], ['desc', 'desc', 'desc', 'desc', 'desc', 'desc', 'asc']);


    let getRow = (player, index) => {
        return ( 
                <LeaderboardRow 
                    levelInfo={props.levelInfo}
                    key={index}
                    index={index}
                    player={player}
                    setLeague={props.setLeague}
                    admin={props.admin}
                    userId={props.loggedInUserId}
                    seasonId={props.seasonId}
                    seasonOver={props.seasonOver}
                />)};

    let megaJem = orderedPlayers.filter(x => x.league === '0').map(getRow);
    let turboJem = orderedPlayers.filter(x => x.league === '1').map(getRow);
    let jem = orderedPlayers.filter(x => x.league === '2').map(getRow);
    //let apprentice = orderedPlayers.filter(x => x.league === '3').map(getRow);

    return (
        <>
        
        <div className='row'>
            <div className='col-8'>
            <h1 className='xs'>Leaderboard</h1>
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
                        <th align='center' className='large'><span role='img' aria-label='diamond'>💎</span></th>
                        <th align='center' className='large'><span role='img' aria-label='platinum'><img src='/assets/Platinum.png' heigh='16' width='16' alt='Platinum' /></span></th>
                        <th align='center' className='large'><span role='img' aria-label='gold'>🥇</span></th>
                        <th align='center' className='large'><span role='img' aria-label='silver'>🥈</span></th>
                        <th align='center' className='large'><span role='img' aria-label='bronze'>🥉</span></th>
                        <th>Total Points</th>
                        <th>Total Time</th>
                        { props.admin && !props.seasonOver && <th></th> }
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th className='leaderboard-header megajem' colSpan={props.admin ? '10' : '9'} >Mega Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {megaJem}
                </tbody>
                <thead>
                    <tr>
                    <th className='leaderboard-header turbojem' colSpan={props.admin ? '10' : '9'}>Turbo Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {turboJem}
                </tbody>
                <thead>
                    <tr>
                        <th className='leaderboard-header jem' colSpan={props.admin ? '10' : '9'}>Jem League</th>
                    </tr>
                </thead>
                <tbody>
                {jem}
                </tbody>
                {/* 
                Not doing this league till seasons grow again
                <thead>
                    <tr>
                        <th className='leaderboard-header apprentice' colSpan={props.admin ? '9' : '8'}>Apprentice League</th>
                    </tr>
                </thead>
                <tbody>
                {apprentice}
                </tbody> */}
            </table>
        </div>
        </>
    )
}

export default Leaderboard;