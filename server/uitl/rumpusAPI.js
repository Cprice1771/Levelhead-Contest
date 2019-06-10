const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')

class RumpusAPI {

    constructor() {

        this.getClient = this.getClient.bind(this);
        this.bulkGetLevels = this.bulkGetLevels.bind(this);
        this.bulkGetUsers = this.bulkGetUsers.bind(this);
        this.getTopScores = this.getTopScores.bind(this);
        this.getLevel = this.getLevel.bind(this);
        this.updateTopScores = this.updateTopScores.bind(this);
    }

    
    async getClient() {

      if(!this.client) {
        
        let cfg = await Config.findOne();
        this.client = rateLimit(Axios.create({
        baseURL: 'https://www.bscotch.net/api/',  
        timeout: 5000,
        headers: {
            'rumpus-credentials' : cfg.key
        }
        }), {  maxRequests: 500, perMilliseconds: 300000});
        this.levelcupKey = cfg.key;
      }

      this.client.defaults.headers['rumpus-credentials'] = this.levelcupKey;
      return this.client;
    }

    async bulkGetLevels(levelIds) {
       
        const httpClient = await this.getClient();
        let newLevelData = [];
        while(levelIds.length > 0) {
          let toGet = levelIds.splice(0, Math.min(64, levelIds.length));
          let levelResults = (await httpClient.get(`storage/crates/lh-published-levels/items?names=${toGet.join(',')}&limit=64`)).data.data;
          newLevelData = newLevelData.concat(levelResults);
        }
    
        return newLevelData;
    }
  
    async bulkGetUsers(users) {
      const httpClient = await this.getClient();
    
      let mappedUsers = [];
      while(users.length > 0) {
        let toGet = users.splice(0, Math.min(64, users.length));
        let userReuslt = (await httpClient.get(`aliases/contexts/levelhead/users?userIds=${toGet.join(',')}`)).data.data;
        mappedUsers = mappedUsers.concat(userReuslt);
      }
    
      return mappedUsers;
    }

    async getLevel(levelId) {
      const httpClient = await this.getClient();
      return (await httpClient.get(`storage/crates/lh-published-levels/items?names=${levelId}&limit=1`)).data.data[0]; //don't ask....
    }

    async getUser(userId) {
      const httpClient = await this.getClient();
      return (await httpClient.get(`aliases/contexts/levelhead/users?userIds=${userId}`)).data.data[0]; //don't ask....
    }
    
    async getTopScores(submissions, contest) {
        let results = submissions.map(x => {
          return { Highscore: x.levelMetaData.records.HighScore[0].userId, 
                    FastestTime: x.levelMetaData.records.FastestTime[0].userId
                }
        }).reduce( (acc, scores) => {
    
            if(contest.countCrowns) {
              var hsIndex = _.findIndex(acc, x => x.user === scores.Highscore);
              if(hsIndex < 0) {
                acc.push({
                  highScores: 0,
                  fastestTimes: 0,
                  total: 0,
                  user: scores.Highscore
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
                  user: scores.FastestTime
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
    
        let usersToGet = _.map(results, x => x.user);
        let users = await this.bulkGetUsers(usersToGet);
        for(var i = 0; i < results.length; i++) {
          let foundMap = _.find(users, x => x.userId === results[i].user);
          if(!!foundMap) {
            results[i].rumpusName = foundMap.alias;
          }
        }
    
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
      const levels = await this.bulkGetLevels(levelIds);

      let usersToGet = [];
      for(var i = 0; i < submissions.length; i++) {
        let foundLevel = _.find(levels, x => x.name === submissions[i].lookupCode);
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

      let users = await this.bulkGetUsers(usersToGet);

      for(var submission of submissions){
        let foundHighscoreUser = _.find(users, x => x.userId === submission.levelMetaData.records.HighScore[0].userId);
        if(!!foundHighscoreUser) {
          submission.levelMetaData.records.HighScore[0].rumpusName = foundHighscoreUser.alias;
        }

        let foundFastestUser = _.find(users, x => x.userId === submission.levelMetaData.records.FastestTime[0].userId);
        if(!!foundFastestUser) {
          submission.levelMetaData.records.FastestTime[0].rumpusName = foundFastestUser.alias;
        }
        
        await submission.save();
      }
      

      let scores = await this.getTopScores(submissions, contest);
      contest.topScores = scores;
      contest.lastUpdatedScores = new Date();
      await contest.save();
      return contest;
    }

    async bookmarkLevel(lookupCode, apiKey) {

      const httpClient = await this.getClient();
      httpClient.defaults.headers['rumpus-credentials'] = apiKey;
      
      return (await httpClient.put(`storage/sets/lh-lvl-sc/users/@me/strings/${lookupCode}?rumpus-version=8.23.16`));
    }
}

module.exports = new RumpusAPI();