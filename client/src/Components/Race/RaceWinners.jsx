import React, { Component } from 'react';
import * as _ from 'lodash';
class RaceWinners extends Component {


    getWinners = () => {

        let winners = _.sortBy(this.props.winners.filter(x => !!x.currentBestTime), (x => x.currentBestTime));
        return winners && winners.slice(0, 3);
    }

    render() {
        let winners =  this.getWinners() || []

        //winners = [{ rumpusAlias: 'QuantumAnomaly' }, { rumpusAlias: 'RetrophileTv' }, { rumpusAlias: 'TalkGibberish' }];;

        let getPosition = (position) => {
            switch(position) {
                case 1:
                    return <h1 className='first-award'>1st</h1>;
                case 2:
                    return <h1 className='second-award'>2nd</h1>;
                case 3:
                    return <h1 className='third-award'>3rd</h1>;
                default:
                    return <h5 className='other'>{position}th</h5>;
            }
        }

        return (<>
            <div style={{ textAlign: 'center', paddingBottom: '50px'}}><h1 className='winner-text'>Winners!</h1></div>
            <div className='winner-box'>
               
                <div className='tpy-1'>
                    { winners.length > 1 && <> 
                    <div className='race-winner-text'>{winners[1].rumpusAlias || winners[1].discordDisplayName}</div>
                    <img src="/assets/item_gr-18_0.png" width="100" alt='gr-18'/>
                    </>
                    }
                    <div className="score-bar1">{ getPosition(2) }</div>
                </div>
                <div className='tpy-2'>
                { winners.length > 0 && <> 
                    <div className='race-winner-text'>{winners[0].rumpusAlias || winners[0].discordDisplayName}</div>
                    <img src="/assets/item_gr-18_1.png" width="100" alt='gr-18'/>
                    </>
                }
                    <div className="score-bar2">{ getPosition(1) }</div>
                  
                </div>
                <div className='tpy-3'>
                { winners.length > 2 && <> 
                    <div className='race-winner-text'>{winners[2].rumpusAlias || winners[2].discordDisplayName}</div>
                    <img src="/assets/item_gr-18_2.png" width="100" alt='gr-18'/>
                    </>
                }
                    <div className="score-bar3">{ getPosition(3) }</div>
                  
                </div>
                
            </div>
            </>
        );
    }
}

export default RaceWinners;