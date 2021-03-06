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

const LEAGUES = [
  {
    leagueId: 0,
    name: 'Mega Jem',
    constName: 'MEGA_JEM',
  },
  {
    leagueId: 1,
    name: 'Turbo Jem',
    constName: 'TURBO_JEM'
  },
  {
    leagueId: 2,
    name: 'Jem',
    constName: 'JEM'
  },

]

class SeasonHelpers {
    constructor() {
        this.updateSeasonLeaderboard = this.updateSeasonLeaderboard.bind(this);
        this.UpdateLevelInfo = this.UpdateLevelInfo.bind(this);
        this.getPlayersForNextSeason = this.getPlayersForNextSeason.bind(this);
        this.getTimeScore = this.getTimeScore.bind(this);
        this.scoreTags = this.scoreTags.bind(this);
        this.saveAward = this.saveAward.bind(this);
        this.handOutAwardForLeague = this.handOutAwardForLeague.bind(this);
        this.handOutAllAwards = this.handOutAllAwards.bind(this);
        this.getRandomLevels = this.getRandomLevels.bind(this);
    }

    async getRandomLevels() {
      var secondsDiff = (new Date().getTime() - new Date(2019, 4, 1).getTime()) / 1000;
      var randomSeconds = Math.floor(Math.random() * secondsDiff)
      
      return await RumpusAPI.searchLevels({
        sort: '-createdAt',
        maxDiamonds: 3,
        limit: 32,
        minSecondsAgo: randomSeconds,
        includeStats: true,
        includeRecords: true,
      });
    }

    async getRandomSpeedrunLevel() {
      let levels = [];
      let attempts = 0;
      const MAX_TRIES = 100;
      do {
        attempts++;
        
        levels.concat(await this.getRandomLevels());
        for(let lvl of levels) {
          lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin, 120, 75, 4000);

          lvl.speedrunScore = (lvl.stats.HiddenGem + this.scoreTags(lvl.tags) + lvl.stats.timeScore);
        }

        levels = _.orderBy(levels, ['speedrunScore'], ['desc']);
        levels = levels.filter(x => x.speedrunScore < 0);
      } while(levels.length == 0 && attempts < MAX_TRIES);

      if(levels.length == 0) {
        levels.concat(await this.getRandomLevels());
      }

      return levels[Math.floor(Math.random() * (levels.length - 1))];
    }

    async getRecommendations(){
      let levels = [];
      let maxHiddenGem = 1000000;
     
      for(let i = 0; i < 3; i++) { // get 3 pages 
        levels = levels.concat(await RumpusAPI.searchLevels({
          sort: 'HiddenHem',
          maxDiamonds: 3,
          limit: 64,
          //only grab levels that have been published for longer than 2 hours, 
          //so that when people start running it, 
          //it (hopefully) graduates quickly from the tower and won't be taken down
          maxHiddenGem: maxHiddenGem,
          minSecondsAgo: 7200,
          maxSecondsAgo: 604800, //only published this week
          tower: true,
          includeStats: true
        }));

        maxHiddenGem = levels[levels.length - 1].stats.HiddenGem - 0.0001;
      }

      for(let lvl of levels) {
        lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin, 120, 75, 4000);

        lvl.speedrunScore = (lvl.stats.HiddenGem + this.scoreTags(lvl.tags) + lvl.stats.timeScore);
      }

      levels = _.orderBy(levels, ['speedrunScore'], ['desc']);

      return levels.slice(0, 10);
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
        ltag_complex: -5,
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

      let playersToEnroll = _.orderBy(lastSeason.entries.filter(x => x.timesSubmitted > 0), ['totalPoints', 'diamonds', 'platinums', 'golds', 'silvers', 'bronzes'], ['desc', 'desc', 'desc', 'desc', 'desc', 'desc']); 
      let numPlayers = playersToEnroll.length;
      if(numPlayers > 0) {
        let MegaJemCutoff = playersToEnroll[Math.min(Math.ceil(numPlayers * .1), numPlayers-1)].totalPoints;
        let turboJemCutoff = playersToEnroll[Math.min(Math.ceil(numPlayers * .5), numPlayers-1)].totalPoints;

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

      return [];
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

        const LIMIT = 128;

        let foundSeason = await Season.findById(seasonId);
        let levels = foundSeason.levelsInSeason.filter(x => x.startDate < new Date()).map(x => x.lookupCode);
        
        if(levels.length === 0) {
          return;
        }

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
                limit: LIMIT
              });
            //scoreResults = _.filter(scoreResults, x => afterDate < new Date(x.updatedAt));
            scores = scores.concat(scoreResults);
            if(scoreResults.length > 0) {
              before = scoreResults[scoreResults.length - 1].updatedAt;
            }
            
          } while(scoreResults.length >= LIMIT);
  
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
              existingScore.value = score.value;
            } else if(foundSeason.seasonType === 'crown' && existingScore.value < score.value) {
              existingScore.value = score.value;
            }
  
          };

          for(let i = 0; i < existingScoresForUser.length; i++) {
            await existingScoresForUser[i].save();
          }

          let entryIndex = _.findIndex(foundSeason.entries, x => x.userId === userInfo.userId);
          foundSeason.entries[entryIndex].diamonds = 0;
          foundSeason.entries[entryIndex].platinums = 0;
          foundSeason.entries[entryIndex].golds = 0;
          foundSeason.entries[entryIndex].silvers = 0;
          foundSeason.entries[entryIndex].bronzes = 0;

          for(let score of existingScoresForUser) {
            let level = foundSeason.levelsInSeason.find(x => x.lookupCode === score.levelLookupCode);

            if(level.bonusAward && level.bonusAward.awardValue > score.value && 
              (!foundSeason.entries[entryIndex].awards || foundSeason.entries[entryIndex].awards.indexOf(level.bonusAward.awardIcon) < 0)) {
              foundSeason.entries[entryIndex].awards.push(level.bonusAward.awardIcon);
            }

            if(level.diamondValue > score.value) {
              foundSeason.entries[entryIndex].diamonds++;
            }
            else if(level.platinumValue > score.value) {
              foundSeason.entries[entryIndex].platinums++;
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
          if(existingScoresForUser.length > 0) {
            foundSeason.entries[entryIndex].totalTime = _.round(existingScoresForUser.reduce((acc, x) => { return acc + _.round(x.value, 2) }, 0), 2);
          }
          
          foundSeason.entries[entryIndex].totalPoints = (foundSeason.entries[entryIndex].diamonds * 5) + 
                                                        (foundSeason.entries[entryIndex].platinums * 4) +
                                                        (foundSeason.entries[entryIndex].golds * 3) +
                                                        (foundSeason.entries[entryIndex].silvers * 2) +
                                                        (foundSeason.entries[entryIndex].bronzes * 1);

        }
        await this.UpdateLevelInfo(foundSeason);
        await foundSeason.save();
        
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

    async handOutAwardForLeague(particpants, league, seasonName) {
      if(particpants.length > 0) {
        await this.saveAward(particpants[0].userId, AccoladeImages[`${league.constName}_FIRST`], `${seasonName} - ${league.name} League 1st Place`, '');
      }

      if(particpants.length > 1) {
        await this.saveAward(particpants[1].userId, AccoladeImages[`${league.constName}_SECOND`], `${seasonName} - ${league.name} League 2nd Place`, '');
      }

      if(particpants.length > 2) {
        await this.saveAward(particpants[2].userId, AccoladeImages[`${league.constName}_THIRD`], `${seasonName} - ${league.name} League 3rd Place`, '');
      }

      for(let place =  3; place < particpants.length; place++) {
        await this.saveAward(particpants[place].userId, AccoladeImages[`${league.constName}_PARTICIPANT`], `${seasonName} - ${league.name} League Participant`, '');
      }
    }

    async handOutAllAwards() {
      let seasons = await Season.find({ $and: [{ endDate: { $lt : new Date() } } ,{ "awardsHandedOut": { $exists: false } }] });
      for(let season of seasons) {
        //League placement awards
        for(let league of LEAGUES) {
          let results = _(season.entries)
            .filter(x => x.timesSubmitted > 0 && x.league == league.leagueId)
            .orderBy(
            ['totalPoints', 'diamonds', 'platinums', 'golds', 'silvers', 'bronzes', 'totalTime'], 
            ['desc', 'desc', 'desc', 'desc', 'desc', 'asc']).value();

          await this.handOutAwardForLeague(results, league, season.name);
        }

        //Medal awards
        let numLevels = season.levelsInSeason.length;
        for(let entry of season.entries) {
          if(entry.diamonds == numLevels) {
            this.saveAward(entry.userId, AccoladeImages.FLAWLESS, `${season.name} - Flawless`, "Get all diamonds in a single season")
          }
          else if((entry.diamonds + entry.platinums + entry.golds) == numLevels) {
            this.saveAward(entry.userId, AccoladeImages.GOLDEN, `${season.name} - Golden`, "Get all golds or better in a single season")
          }
          else if((entry.diamonds + entry.platinums + entry.golds + entry.silvers) == numLevels) {
            this.saveAward(entry.userId, AccoladeImages.SILVER, `${season.name} - Silver`, "Get all silvers or better in a single season")
          }
          else if((entry.diamonds + entry.platinums + entry.golds + entry.silvers + entry.bronzes) == numLevels) {
            this.saveAward(entry.userId, AccoladeImages.COMPLETIONIST, `${season.name} - Bronzed`, "Get all bronze medals or better in a single season")
          }
        }

        season.awardsHandedOut = true;
        await season.save();
        
      }
    }
}

module.exports = new SeasonHelpers();