import React from 'react';
import * as _ from 'lodash';
import LevelBoardRow from './levelBoardRow';

function LevelBoard (props) {
    let orderedLevels = _.orderBy(props.levels, ['startDate'], ['asc']);
    if(!props.admin) {
        orderedLevels = orderedLevels.filter(x => new Date(x.startDate) < new Date());
    }

    let levels = orderedLevels.map((lvl) => {

        let scheduled = new Date(lvl.startDate) > new Date();
        return ( 
            <LevelBoardRow 
            key={lvl.lookupCode}
            lvl={lvl}
            scheduled={scheduled}
            {...props}
            />
        )
                })

    return (
        <>
        <div className='row'>
            <div className='col-md-10'><h1 style={{ display: 'inline-block'}}>Challenges </h1> { props.admin && !props.seasonOver && <i className="fas fa-question-circle fa-1x pull-up"  onClick={props.showRecommend}></i> }</div>
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
                        <th className='smll'>Creator</th>
                        <th>Lookup</th>
                        <th className='smll'>Diamond</th>
                        <th className='smll'>Platinum</th>
                        <th className='smll'>Gold</th>
                        <th className='smll'>Silver</th>
                        <th className='smll'>Bronze</th>
                        <th>Current WR</th>
                        {props.canBookmark && <th></th> }
                        { props.admin && !props.seasonOver && <th></th>}
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

export default LevelBoard;