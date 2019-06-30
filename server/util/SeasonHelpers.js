const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')
const Season = require('../models/Speedrun/Season');
const UserScore = require('../models/Speedrun/userScore');
const RumpusAPI = require('./rumpusAPI');

class SeasonHelpers {
    constructor() {
        this.updateSeasonLeaderboard = this.updateSeasonLeaderboard.bind(this);
        this.UpdateLevelInfo = this.UpdateLevelInfo.bind(this);
        this.getPlayersForNextSeason = this.getPlayersForNextSeason.bind(this);
        this.getTimeScore = this.getTimeScore.bind(this);
        this.scoreTags = this.scoreTags.bind(this);
    }

    async getRecommendations(){

      let levels = await RumpusAPI.searchLevels({
        sort: 'HiddenHem',
        excludeTags: ['ltag_brawler','ltag_contraption', 'ltag_shop', 'ltag_long', 'ltag_dontmove', 'ltag_elite'],
        minClearRate: 0.09,
        minTimePerWin: 15,
        maxTimePerWin: 300,
        minSecondsAgo: 7200,
        includeStats: true,
      })

      for(let lvl of levels) {
        lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin, 120, 75, 4000);

        lvl.speedrunScore = (lvl.stats.timeScore + lvl.stats.HiddenGem + this.scoreTags(lvl.tags));
      }

      levels = _.orderBy(levels, ['speedrunScore'], ['desc']);

      return levels;


    }

    getTimeScore(x, mean, std, multiply) {
      return multiply * (1 / (std*Math.sqrt(2 * Math.PI))) * Math.exp(-((x-mean)^2)/(2*std*std))
    }

    scoreTags(tags) {
      var score = 0;
      let tagScoreSheet = {
        ltag_elite: -15,
        ltag_newbie: 5,
        ltag_simple: 5,
        ltag_casual: 10,
        ltag_panic: 0,
        ltag_pjp: -5,
        ltag_precise: 10,
        ltag_precarious: 10,
        ltag_electrodongle: 5,
        ltag_secret: 0,
        ltag_intense: 5,
        ltag_choice: 0,
        ltag_raceway: 10,
        ltag_traps: 0,
        ltag_brawler: -100,
        ltag_eye: 0,
        ltag_paced: 10,
        ltag_puzzle: -5,
        ltag_bombs: 0,
        ltag_blasters: 0,
        ltag_paths: 0,
        ltag_contraption: -10,
        ltag_clever: 5,
        ltag_elite: -20,
        ltag_musicbox: 0,
        ltag_chase: -10,
        ltag_powerup: 0,
        ltag_complex: -10,
        ltag_throwing: -5,
        ltag_explore: -10,
        ltag_switch: 0,
        ltag_igneum: 0,
        ltag_kaizo: 0,
        ltag_dontmove: -100,
        ltag_juicefusion: 0,
        ltag_quick: 10,
        ltag_long: -10,
        ltag_shop: -10,
      }

      for(var tag in tags) {
        score += tagScoreSheet[tag];
      }

      return score;
    }

    async getPlayersForNextSeason(seasonType) {
      
      let lastSeason = await Season.findOne({ seasonType: seasonType }).sort({ endDate: -1 });

      if(!lastSeason) {
        return [];
      }

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