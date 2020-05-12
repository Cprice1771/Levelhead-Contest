const _ = require('lodash');
const RumpusAPI = require('./rumpusAPI');
const RoomEntrants = require('../models/multiplayer/roomEntrant');
const Room = require('../models/multiplayer/room');
const moment = require('moment');
const SocketManager = require('./SocketManager');
class MultiplayerHelpers {
    constructor() {
        this.getRandomSpeedrunLevel = this.getRandomSpeedrunLevel.bind(this);
        this.getTimeScore = this.getTimeScore.bind(this);
        this.scoreTags = this.scoreTags.bind(this);
        this.getRandomLevels = this.getRandomLevels.bind(this);
        this.startLevelForRoom = this.startLevelForRoom.bind(this); 
        this.startDowntimeForRoom = this.startDowntimeForRoom.bind(this);
        this.updateRoom = this.updateRoom.bind(this);
        this.hasAnyonePlayed = this.hasAnyonePlayed.bind(this);
    }

    async getRandomLevels(diamonds) {
      var secondsDiff = (new Date().getTime() - new Date(2020, 4, 1).getTime()) / 1000;
      var randomSeconds = Math.floor(Math.random() * secondsDiff);
      var randomGem = (Math.random() * 200) + 100;
      return await RumpusAPI.searchLevels({
        sort: 'HiddenGem', //-createdAt TODO
        //levelIds: ['mznrg6z', 'dnclz0w', 'mmbmcff', '9r0tl65', 'cl21zht', 'mcw8f6q', '409vd9j'],//TODO remove me
        Diamonds: diamonds,
        //tower: true,
        limit: 32,
        //minSecondsAgo: randomSeconds,
        maxSecondsAgo: 86400 * 10,
        maxHiddenGem: randomGem,
        includeStats: true,
        includeRecords: true,
      });
    }

    async updateRoom(room) {
      let roomResp = room.toObject();
      let entrants = (await RoomEntrants.find({ roomId: room._id }));
      let activeEntrants = [];
      for(const entrant of entrants) {
        if(!entrant.lastKeepAlive || moment().diff(moment(entrant.lastKeepAlive), 'seconds') > 120) {
          await RoomEntrants.deleteOne({ _id: entrant._id });
        } else {
          activeEntrants.push(entrant);
        }
      }

      roomResp.entrants = activeEntrants;
      SocketManager.emit(`room-update-${room._id}`, roomResp);
    }

    async getRandomSpeedrunLevel(userIds) {
      let levels = [];
      let attempts = 0;
      const MAX_TRIES = 10;
      do {
        attempts++;
        let randomLevels = await this.getRandomLevels(2);//Math.floor(Math.random() * 2) +
        levels = levels.concat(randomLevels);
  
        for(let lvl of levels) {
          lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin, 80, 75, 4000);
          lvl.speedrunScore = (this.scoreTags(lvl.tags) + lvl.stats.timeScore);
          //lvl.speedrunScore = 10;

          if(lvl.records.FastestTime[0].value < 5) {
            lvl.speedrunScore = -100;
          }
        }

        levels = _.orderBy(levels, ['speedrunScore'], ['desc']);
        levels = levels.filter(x => x.speedrunScore >= 0);
      } while(levels.length < 160 && attempts < MAX_TRIES);
      if(levels.length == 0) {
        levels = levels.concat(await this.getRandomLevels(2));
      }
      levels = _.shuffle(levels);

      var levelToPick = 0;
      for(levelToPick = 0; levelToPick < levels.length; levelToPick++) {
        if(!await this.hasAnyonePlayed(levels[levelToPick].levelId, userIds)) {
          break;
        }
      }
    
      if(levelToPick >= levels.length) {
        levelToPick = 0; 
      }

      return levels[levelToPick];
    }

    getTimeScore(x, mean, std, multiply) {

      if(x > 180 || x < 15) {
        return -10000;
      }
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
        ltag_brawler: -1000,
        ltag_eye: 0,
        ltag_paced: 10,
        ltag_puzzle: -5,
        ltag_bombs: 0,
        ltag_blasters: 0,
        ltag_paths: 0,
        ltag_contraption: -100,
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
        ltag_dontmove: -100000,
        ltag_juicefusion: 0,
        ltag_quick: 10,
        ltag_long: -10,
        ltag_shop: -10,
        ltag_faceblaster: 0,
        ltag_onescreen: -10,
        ltag_troll: -10000,
        ltag_teach: -10,
        ltag_boss: -20,
      }

      for(var tag in tags) {
        score += tagScoreSheet[tag] || 0;
      }

      return score * 10;
    }

    async startLevelForRoom(room) {
        var users = (await RoomEntrants.find({ roomId: room._id })).map(x => x.rumpusId);
        let level = (await this.getRandomSpeedrunLevel(users));
        room.currentLevelCode = level.levelId;
        room.levelDetails = level;
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
        return room;
    }

    async hasAnyonePlayed(levelId, userIds) {
      const LIMIT = 128;

      if(!userIds || userIds.length === 0) {
        return false;
      }
      var scoreResults = await RumpusAPI.getRecentRecords('FastestTime', 
      { levelIds: [levelId],
        userIds: userIds,
        limit: LIMIT
      });
      return scoreResults.length > 0
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