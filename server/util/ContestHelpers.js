const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')
const Season = require('../models/Speedrun/Season');
const UserScore = require('../models/Speedrun/UserScore');
const RumpusAPI = require('./rumpusAPI');

class SeasonHelpers {
    constructor() {

        this.getTopScores = this.getTopScores.bind(this);
        this.updateTopScores = this.updateTopScores.bind(this);
    }

    async getTopScores(submissions, contest) {
        let results = submissions.map(x => {
          return {  Highscore: x.levelMetaData.records.HighScore[0].userId, 
                    HighscoreAlias: x.levelMetaData.records.HighScore[0].alias.alias,
                    FastestTime: x.levelMetaData.records.FastestTime[0].userId,
                    FastestTimeAlias: x.levelMetaData.records.FastestTime[0].alias.alias,
                }
        }).reduce( (acc, scores) => {
    
            if(contest.countCrowns) {
              var hsIndex = _.findIndex(acc, x => x.user === scores.Highscore);
              if(hsIndex < 0) {
                acc.push({
                  highScores: 0,
                  fastestTimes: 0,
                  total: 0,
                  user: scores.Highscore,
                  rumpusName: scores.HighscoreAlias,
                });
                hsIndex = acc.length - 1;
              }

              acc[hsIndex].highScores++;
              acc[hsIndex].total++;
            }
    

            if(contest.countShoes) {
              var timeIdx = _.findIndex(acc, x => x.user === scores.FastestTime);
              if(timeIdx < 0) {
                acc.push({
                  highScores: 0,
                  fastestTimes: 0,
                  total: 0,
                  user: scores.FastestTime,
                  rumpusName: scores.FastestTimeAlias,
                });
                timeIdx = acc.length - 1;
              }
      
              acc[timeIdx].fastestTimes++;
              acc[timeIdx].total++;
            }
    
            return acc;
    
        }, []);

        results = _.orderBy(results, ['total'], ['desc']);
        results = results.splice(0, 10);
    
        return results;
    }

    async updateTopScores(contestId) {
      let contest = await Contest.findById(contestId);

      if(!contest.displayTopScore) {
        return;
      }

      let submissions = await Submission.find({ contestId: contestId});
      if(submissions.length === 0){
        return;
      }

      let levelIds = _.map(submissions, x => x.lookupCode);
      const levels = await RumpusAPI.bulkGetLevels(levelIds);

      let usersToGet = [];
      for(var i = 0; i < submissions.length; i++) {
        let foundLevel = _.find(levels, x => x.levelId === submissions[i].lookupCode);
        if(!!foundLevel) {
          submissions[i].levelMetaData = foundLevel;

          if(_.indexOf(usersToGet, foundLevel.records.HighScore[0].userId) < 0) {
            usersToGet.push(usersToGet, foundLevel.records.HighScore[0].userId)
          }

          if(_.indexOf(usersToGet, foundLevel.records.FastestTime[0].userId) < 0) {
            usersToGet.push(usersToGet, foundLevel.records.FastestTime[0].userId)
          }
        }
      }

      
      for(var submission of submissions){
        
        submission.levelMetaData.records.HighScore[0].rumpusName = submission.levelMetaData.records.HighScore[0].alias.alias;

        submission.levelMetaData.records.FastestTime[0].rumpusName = submission.levelMetaData.records.FastestTime[0].alias.alias;
        
        await submission.save();
      }
      

      let scores = await this.getTopScores(submissions, contest);
      contest.topScores = scores;
      contest.lastUpdatedScores = new Date();
      await contest.save();
      return contest;
    }
    
}

module.exports = new SeasonHelpers();