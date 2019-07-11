import React, { Component } from 'react';
import axios from 'axios'
import { endPoints} from '../../Constants/Endpoints';
import ReactModal from 'react-modal';
import { NotificationManager } from 'react-notifications';
import * as _ from 'lodash';

class RecommendLevelModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            levels: [],
            loading: false
        }

        this.getRecommendations = this.getRecommendations.bind(this);
    }

    componentDidMount() {
       this.getRecommendations();
    }

    async getRecommendations() {
        try {
            this.setState({ loading: true });
            let resp = await axios.get(endPoints.GET_RECOMMENDED_LEVELS);

            if(resp.data.success) {
                this.setState({ levels: resp.data.levels })
                console.log(resp.data.levels.length);
            } else {
                NotificationManager.error('Failed to get recommended levels');
            }
        } catch(err) {
            NotificationManager.error('Failed to get recommended levels');
        }
        finally {
            this.setState({ loading: false });
        }
    }


    async likeLevel() {

    }

    async booLevel() {

    }
   

    render() {

        return (
        <ReactModal
          isOpen={this.props.showModal}
          onRequestClose={() =>{
            this.props.handleCloseModal();
          }}
          contentLabel="Enter Rumpus Id"
          className='Modal level-modal'
        >
        <i className="fas fa-times modalClose"  onClick={() =>{
            this.props.handleCloseModal();
          }}></i>

        <div className='modal-container'>
        <h2>Level Suggestions</h2>
        { this.props.canBookmark && <button 
                onClick={this.props.bookmarkAll}
                 style={{
                    marginRight: '10px',
                    borderRadius: '5px',
                    border: 'none',
                    paddingTop: '10px',
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    right: '25px',
                    top: '35px', 
                }}>Bookmark All</button>}
        { this.state.loading ?  
        <div className='spinner-container'><i className='fas fa-spinner fa-spin fa-5x'></i></div> :
        <div className='level-suggest-container'>
            <table className="table table-striped level-suggest-table ">
                <tr>
                    <th>Level Name</th>
                    <th>Lookup Code</th>
                    <th>Clear Rate</th>
                    {/* <th>Like</th>
                    <th>Boo</th> */}
                    {this.props.canBookmark &&<th>Bookmark</th>}
                </tr>
                {
                    this.state.levels.map(x => {
                        return (
                            <tr>
                                <td>{x.title}</td>
                                <td><a href={`https://lvlhd.co/+${x.levelId}`} target="_blank" rel="noopener noreferrer" className="levelLink">{x.levelId}</a></td>
                                <td>{x.stats.Attempts === 0 ? 0 : _.round(((x.stats.Successes / x.stats.Attempts) * 100), 2)}%</td>
                                {/* <td><i className="fas fa-thumbs-up"  onClick={this.likeLevel}></i></td>
                                <td><i className="fas fa-thumbs-down"  onClick={this.booLevel}></i></td> */}
                                {this.props.canBookmark && <td align="center"><i className='fas fa-bookmark fa-2x' style={{color: '#7D6B91', cursor: 'pointer'}} onClick={() => { this.props.bookmark([x.levelId])}}> </i></td>}
                            </tr>
                        )
                    })
                }
            </table>
        </div>
        }
        </div>

        </ReactModal>);
    }
}

export default RecommendLevelModal;