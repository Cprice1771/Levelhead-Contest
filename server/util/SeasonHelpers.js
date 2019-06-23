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
        this.UpdateLevelInfo = this.UpdateLevelInfo.bind(this);
        this.getPlayersForNextSeason = this.getPlayersForNextSeason.bind(this);
    }

    async getPlayersForNextSeason(seasonType) {
      
      let lastSeason = await Season.findOne({ seasonType: seasonType }).sort({ endDate: -1 });

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

    async UpdateLevelInfo(season) {
      let levelLookupCodes = season.levelsInSeason.map(x => x.lookupCode);
      let levels = await RumpusAPI.bulkGetLevels(levelLookupCodes);
      for(let level of levels) {
        let lvlIndex = _.findIndex(season.levelsInSeason, x => x.lookupCode === level.levelId);
        season.levelsInSeason[lvlIndex].record = { alias: level.records.FastestTime[0].alias.alias, value: level.records.FastestTime[0].value }
      }
    }

    async updateSeasonLeaderboard(seasonId) {
        let foundSeason = await Season.findById(seasonId);
        let levels = foundSeason.levelsInSeason.filter(x => x.startDate < new Date()).map(x => x.lookupCode);
        
        for(let i = 0; i < foundSeason.entries.length; i++) {
          let scores = [];
          let before = new Date();
          let userInfo = foundSeason.entries[i];
          let afterDate = userInfo.lastUpdatedScores || new Date(new Date() - (21 * 86400000));
          foundSeason.entries[i].lastUpdatedScores = new Date();
          do {
            var scoreResults = await RumpusAPI.getRecentRecords(
              foundSeason.seasonType === 'speedrun' ? 'FastestTime': 'HighScore', 
              { levelIds: levels,
                userIds: userInfo.rumpusId,
                before: before,
                limit: 128
              });
            scoreResults = _.filter(scoreResults, x => afterDate < new Date(x.updatedAt));
            scores = scores.concat(scoreResults);
            if(scoreResults.length > 0) {
              before = scoreResults[scoreResults.length - 1].updatedAt;
            }
            
          } while(scoreResults.length >= 128);
  
          let existingScoresForUser = await UserScore.find({ seasonId: foundSeason._id, userId: userInfo.userId });
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

            if(level.legendValue && level.legendValue > score.value) {
              foundSeason.entries[entryIndex].hasLegend = true;
            }

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

          foundSeason.entries[entryIndex].timesSubmitted = existingScoresForUser.length;
          foundSeason.entries[entryIndex].totalPoints = (foundSeason.entries[entryIndex].diamonds * 5) + 
                                                        (foundSeason.entries[entryIndex].golds * 3) +
                                                        (foundSeason.entries[entryIndex].silvers * 2) +
                                                        (foundSeason.entries[entryIndex].bronzes * 1);

        }
        

        
        await this.UpdateLevelInfo(foundSeason);
        await foundSeason.save();
        
    }
}

module.exports = new SeasonHelpers();