const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')
const Season = require('../models/speedrun/season');
const UserScore = require('../models/speedrun/UserScore');
const RumpusAPI = require('./rumpusAPI');

class SeasonHelpers {
    constructor() {
        this.updateSeasonLeaderboard = this.updateSeasonLeaderboard.bind(this);
    }

    async getPlayersForNextSeason() {
      let lastSeason = Season.findOne().sort({ endDate: -1 });
      let playersToEnroll = _.orderBy(lastSeason.entries.filter(x => x.timesSubmitted > 0), ['totalPoints', 'diamonds', 'golds', 'silvers', 'bronzes'], ['desc', 'desc', 'desc', 'desc', 'desc']); 
      let numPlayers = playersToEnroll.length;
      let MegaJemCutoff = playersToEnroll[Math.ceil(numPlayers * .1)].totalPoints;
      let turboJemCutoff = playersToEnroll[Math.ceil(numPlayers * .33)].totalPoints;

      let newPlayers = playersToEnroll.map(x => {

        let newLeague = 0;
        if(x.totalPoints >= MegaJemCutoff) {
          newLeague = 0;
        } else if(x.totalPoints >= turboJemCutoff) {
          newLeague = 1;
        } else {
          newLeague = 2;
        }

        return {
          userId: x.userId,
          rumpusId: x.rumpusId,
          rumpusAlias: x.rumpusAlias,
          diamonds: 0,
          golds: 0,
          silvers: 0,
          bronzes: 0,
          totalPoints: 0,
          timesSubmitted: 0,
          league: newLeague
        };
      });
      
      return newPlayers;
    }

    async updateSeasonLeaderboard(seasonId) {
        let foundSeason = await Season.findById(seasonId);
        let entrees = foundSeason.entries.map(x => {  return { userId: x.userId, rumpusId: x.rumpusId, rumpusAlias: x.rumpusAlias } });
        let levels = foundSeason.levelsInSeason.filter(x => x.startDate < new Date());
        
        for(var userInfo of entrees) {
          let scores = [];
          let before = new Date();
          for(var level of levels) {
            let afterDate = level.lastUpdatedScores || new Date(new Date() - (21 * 86400000)); 
            do {
              var scoreResults = await RumpusAPI.getRecentRecords(
                foundSeason.seasonType === 'speedrun' ? 'FastestTime': 'HighScore', 
                { levelIds: level.lookupCode,
                  userIds: userInfo.rumpusId,
                  before: before,
                  limit: 128
                });
              scoreResults = _.filter(scoreResults, x => afterDate < new Date(x.updatedAt));
              scores = scores.concat(scoreResults);
            } while(scoreResults.length >= 128);
          }
         
  
          let existingScoresForUser = await UserScore.find({ seasonId: foundSeason.seasonId, userId: userInfo.userId });
          for(let score of scores) {
            let existingScore = existingScoresForUser.find(x => x.levelLookupCode === score.levelId);
            if(!existingScore) {
              existingScoresForUser.push(new UserScore({
                seasonId: seasonId,
                levelLookupCode: score.levelId,
                value: score.value, 
                userId: userInfo.userId,
                rumpusId: userInfo.rumpusId,
                rumpusAlias: userInfo.rumpusAlias
              }));
            } else if(foundSeason.seasonType === 'speedrun' && existingScore.value > score.value) {
              existingScoresForUser.value = score.value;
            } else if(foundSeason.seasonType === 'crown' && existingScore.value < score.value) {
              existingScoresForUser.value = score.value;
            }
  
          };

          for(let i = 0; i < existingScoresForUser.length; i++) {
            await existingScoresForUser[i].save();
          }

          let entryIndex = _.findIndex(foundSeason.entries, x => x.userId === userInfo.userId);
          foundSeason.entries[entryIndex].diamonds = 0;
          foundSeason.entries[entryIndex].golds = 0;
          foundSeason.entries[entryIndex].silvers = 0;
          foundSeason.entries[entryIndex].bronzes = 0;

          for(let score of existingScoresForUser) {
            let level = foundSeason.levelsInSeason.find(x => x.lookupCode === score.levelLookupCode);

            if(level.diamondValue > score.value) {
              foundSeason.entries[entryIndex].diamonds++;
            }
            else if(level.goldValue > score.value) {
              foundSeason.entries[entryIndex].golds++;
            }
            else if(level.silverValue > score.value) {
              foundSeason.entries[entryIndex].silvers++;
            }
            else if(level.bronzeValue > score.value) {
              foundSeason.entries[entryIndex].bronzes++;
            }
          }

          foundSeason.entries[entryIndex].totalPoints = (foundSeason.entries[entryIndex].diamonds * 5) + 
                                                        (foundSeason.entries[entryIndex].golds * 3) +
                                                        (foundSeason.entries[entryIndex].silvers * 2) +
                                                        (foundSeason.entries[entryIndex].bronzes * 1);

        }

        for(var i = 0; i < foundSeason.levelsInSeason.length; i++) {
          foundSeason.levelsInSeason[i].lastUpdatedScores = new Date();
        }
        
        await foundSeason.save();
    }
}

module.exports = new SeasonHelpers();