const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')
const Season = require('../models/Speedrun/Season');
const UserScore = require('../models/Speedrun/userScore');
const RumpusAPI = require('./rumpusAPI');
const AccoladeImages = require('./AccoladeImages');
const UserAward = require('../models/userAward');
const User = require('../models/user');

class SeasonHelpers {
    constructor() {

        this.getTopScores = this.getTopScores.bind(this);
        this.updateTopScores = this.updateTopScores.bind(this);
        this.saveAward = this.saveAward.bind(this);
        this.handOutAwardForContest = this.handOutAwardForContest.bind(this);
        this.handOutAwards = this.handOutAwards.bind(this);
        this.assignPositions = this.assignPositions.bind(this);
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

    async saveAward(userId, awardImage, awardTitle, description) {
      const award = new UserAward({
        userId: userId,
        award: awardTitle,
        awardImage,
        description,
        awardType: 'season'
      });

      await award.save();
    }

    assignPositions(submissions) {
      if(!submissions || submissions.length <= 0) 
        return submissions;

      let position = 1;
      submissions[0].position = position;
      for(let index = 1; index < submissions.length; index++) {
        if(submissions[index-1].votes !== submissions[index].votes) {
          position = index + 1;
        }
        submissions[index].position = position;
      }

      return submissions;
    }

    async handOutAwardForContest(particpants, contestName) {
      for(let participant of particpants) {
        switch(participant.position) {
          case 1:
            await this.saveAward(participant.submittedByUserId, AccoladeImages.CONTEST_WINNER, `${contestName} Winner`, 'Won the community vote for a levelcup')
            break;
          case 2:
          //TODO: add 2nd, third and participant awards
            //await this.saveAward(participant.submittedByUserId, AccoladeImages.CONTEST_SECOND, `${contestName} Runner Up`, '2nd Place in community vote')
            break;
          case 3:
           // await this.saveAward(participant.submittedByUserId, AccoladeImages.CONTEST_THIRD, `${contestName}  Third Place`, '3rd Place in community vote')
            break;
          default:
            //await this.saveAward(participant.submittedByUserId, AccoladeImages.CONTEST_WINNER, `${contestName} Participant`, 'Entered levelcup')
            break;

        }
      }
    }
    
    async handOutAwards() {
      let contests = await Contest.find({ $and: [{ votingEndDate: { $lt : new Date() } } ,{ "handedOutAwards": { $exists: false } }] });
      for(let contest of contests) {
        let contestName = contest.name;
        //Finish awards
        if(contest.contestType === 'building') {
          let submissions = await Submission.find({ contestId: contest._id});
          submissions = _(submissions).orderBy(['votes'], ['desc']).value();
          submissions = this.assignPositions(submissions);
          await this.handOutAwardForContest(submissions, contestName);
        }

        //Top Score
        if(contest.topScores && contest.topScores.length > 0) {
          let user = await User.findOne({ "rumpusId": contest.topScores[0].user });
          if(user) {
            await this.saveAward(user._id, AccoladeImages.CONTEST_TOP_SCORE, `${contestName} Top Score`, "Most shoes and crowns on all levelcup entries");
          }
        }
        
        contest.handedOutAwards = true;
        await contest.save();
      }
    }
}

module.exports = new SeasonHelpers();