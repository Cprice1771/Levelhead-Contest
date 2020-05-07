const _ = require('lodash');
const RumpusAPI = require('./rumpusAPI');
const RoomEntrants = require('../models/multiplayer/roomEntrant');
const moment = require('moment');

class MultiplayerHelpers {
    constructor() {
        this.getRandomSpeedrunLevel = this.getRandomSpeedrunLevel.bind(this);
        this.getTimeScore = this.getTimeScore.bind(this);
        this.scoreTags = this.scoreTags.bind(this);
        this.getRandomLevels = this.getRandomLevels.bind(this);
        this.startLevelForRoom = this.startLevelForRoom.bind(this); 
        this.startDowntimeForRoom = this.startDowntimeForRoom.bind(this);
    }

    async getRandomLevels() {
      var secondsDiff = (new Date().getTime() - new Date(2019, 4, 1).getTime()) / 1000;
      var randomSeconds = Math.floor(Math.random() * secondsDiff)
      //console.log(randomSeconds)
      return await RumpusAPI.searchLevels({
        sort: 'createdAt',
        //maxDiamonds: 3,
        //minDiamonds: 3,
        tower: true,
        limit: 32,
        minSecondsAgo: randomSeconds,
        includeStats: true,
        includeRecords: true,
      });
    }

    async getRandomSpeedrunLevel() {
      let levels = [];
      let attempts = 0;
      const MAX_TRIES = 10;
      do {
        attempts++;
        let randomLevels = await this.getRandomLevels();
        levels = levels.concat(randomLevels);
  
        for(let lvl of levels) {
          lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin, 120, 75, 4000);
          lvl.speedrunScore = (lvl.stats.HiddenGem + this.scoreTags(lvl.tags) + lvl.stats.timeScore);
          console.log(lvl.stats.Diamonds);
          //TODO: remove me when the API works
          if(lvl.stats.Diamonds === undefined || lvl.stats.Diamonds > 3) {
            lvl.speedrunScore = -10000;
          }
        }

        levels = _.orderBy(levels, ['speedrunScore'], ['desc']);
        //console.log(levels.map(x => x.speedrunScore));
        levels = levels.filter(x => x.speedrunScore > 0);
        console.log(levels);
      } while(levels.length == 0 && attempts < MAX_TRIES);

      

      if(levels.length == 0) {
        levels = levels.concat(await this.getRandomLevels());
      }
      var index = Math.floor(Math.random() * (levels.length - 1));
      return levels[index];
    }

    getTimeScore(x, mean, std, multiply) {

      if(x > 120) {
        return -10000;
      }

      return 0;

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
        ltag_faceblaster: 0,
        ltag_onescreen: -10,
        ltag_troll: -100,
        ltag_teach: -10,
        ltag_boss: -20,
      }

      for(var tag in tags) {
        score += tagScoreSheet[tag] || 0;
      }

      return score * 10;
    }

    async startLevelForRoom(room) {
        room.currentLevelCode = (await this.getRandomSpeedrunLevel()).levelId;
        room.currentPhaseStartTime = moment(new Date()).startOf('minute').toDate();//room.nextPhaseStartTime; TODO figure this out
        room.nextPhaseStartTime = moment(room.currentPhaseStartTime).add(room.levelTime, 'seconds').toDate();
        room.phase = 'level';
        await room.save();

        let entrants = await RoomEntrants.find({ roomId: room._id });
        
        for(var entry of entrants) {
            entry.currentBestTime = null;
            await entry.save();
        }

        return room;
    }

    async startDowntimeForRoom(room) {
        room.currentPhaseStartTime = moment(new Date()).startOf('minute').toDate();//room.nextPhaseStartTime; TODO figure this out
        room.nextPhaseStartTime = moment(room.currentPhaseStartTime).add(room.downtime, 'seconds').toDate();
        room.phase = 'downtime';
        await room.save();
    }

    async getScoresForLevel(levelId, levelStart, roomId) {
        const LIMIT = 128;

        if(!levelId || !levelStart || !roomId) {
          return;
        }

        let roomEntrants = await RoomEntrants.find({ roomId: roomId });

        if(!roomEntrants) {
            return;
        }

        for(let i = 0; i < roomEntrants.length; i += 32) {
          let scores = [];
          let before = new Date();
          let userIds = roomEntrants.slice(i, i+32).map(x => {
              return x.rumpusId
          }).join(',');
          
          do {
            console.log({ levelIds: [levelId],
              userIds: userIds,
              after: levelStart,
              before: before,
              limit: LIMIT
            })
            var scoreResults = await RumpusAPI.getRecentRecords('FastestTime', 
              { levelIds: [levelId],
                userIds: userIds,
                after: levelStart,
                before: before,
                limit: LIMIT
              });
            scores = scores.concat(scoreResults);
            if(scoreResults.length > 0) {
              before = scoreResults[scoreResults.length - 1].updatedAt;
            }
            
          } while(scoreResults.length >= LIMIT);

          for(let score of scores) {
            let entrant = roomEntrants.find(x => x.rumpusId === score.userId);
            if(!entrant) {
                continue;
            }

            if(entrant.currentBestTime === null || entrant.currentBestTime > score.value) {
                entrant.currentBestTime = score.value;
                await entrant.save();
            }
          }
        }
    }
}

module.exports = new MultiplayerHelpers();