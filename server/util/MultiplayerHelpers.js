const _ = require('lodash');
const RumpusAPI = require('./rumpusAPI');
const RoomEntrants = require('../models/multiplayer/roomEntrant');
const Room = require('../models/multiplayer/room');
const moment = require('moment');
const SocketManager = require('./SocketManager');
const { Random } = require("random-js");
const User = require('../models/user');


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
        this.handoutAwardsForRoom = this.handoutAwardsForRoom.bind(this);
        this.getReplayScore = this.getReplayScore.bind(this);
        this.random = new Random(); // uses the nativeMath engine
    }

    async getRandomLevels(diamonds, maxGem, tiebreakerItemId = null) {

      var date = new Date();
      var maxMonthsAgo = Math.abs(moment().diff(new Date(2019, 4, 1), 'months'))
      var randMonths = Math.floor((maxMonthsAgo * Math.random()))

      const fromDate = moment().add(-1 * randMonths, 'M')
      const toDate = moment(fromDate).add(1, 'M')
      var reqParams = {
        sort: 'createdAt',
        maxDiamonds: diamonds,
        minCreatedAt: fromDate.toISOString(),
        maxCreatedAt: toDate.toISOString(),
        tower: true,
        limit: 32,
        maxHiddenGem: 10000,
        includeStats: true,
        includeRecords: true,
      };
      return await RumpusAPI.searchLevels(reqParams);
    }

    async updateRoom(room) {
      let roomResp = room.toObject();
      let entrants = (await RoomEntrants.find({ roomId: room._id }));
      let activeEntrants = [];
      for(const entrant of entrants) {
        if((!entrant.lastKeepAlive || moment().diff(moment(entrant.lastKeepAlive), 'seconds') > 120) || (entrant.lastUpdatedDate && moment().diff(moment(entrant.lastKeepAlive), 'seconds') > 1800)) {
          await RoomEntrants.deleteOne({ _id: entrant._id });
        } else {
          activeEntrants.push(entrant);
        }
      }

      roomResp.entrants = activeEntrants;
      SocketManager.emit(`room-update-${room._id}`, roomResp);
    }

    async getRandomSpeedrunLevel(room, userIds) {

      if(room.levelsInQueue && room.levelsInQueue.length > 0) {
        do{
          let idToPlay = room.levelsInQueue.shift();
          if(!(await this.hasAnyonePlayed(idToPlay, userIds))) {
            var level = await RumpusAPI.searchLevels({
              levelIds: [idToPlay],
              includeStats: true,
              includeRecords: true,
            });
            
            return level[0];
          }
        } while(room.levelsInQueue.length > 0)
      }

      let levels = [];
      let attempts = 0;
      const MAX_TRIES = 20;
      let maxGem = 10000;
      let tieBreakerId = null;
      do {
        attempts++;
        let randomLevels = await this.getRandomLevels(2, maxGem, tieBreakerId);
        maxGem = randomLevels[randomLevels.length - 1].stats.HiddenGem;
        tieBreakerId = randomLevels[randomLevels.length - 1]._id
        levels = levels.concat(randomLevels);
  
        for(let lvl of levels) {
          lvl.stats.timeScore = this.getTimeScore(lvl.stats.TimePerWin);
          lvl.speedrunScore = (this.scoreTags(lvl.tags) + lvl.stats.timeScore + this.getReplayScore(lvl.stats.ReplayValue));
          if(lvl.records.FastestTime[0].value <= 10) {
            lvl.speedrunScore = -100000;
          }

          if(lvl.requiredPlayers > 1) {
            lvl.speedrunScore = -1000000;
          }
        }

        levels = _.orderBy(levels, ['speedrunScore'], ['desc']);
        levels = levels.filter(x => x.speedrunScore >= 0);
      } while(attempts < MAX_TRIES);

      let levelToPlay = levels.shift();
      room.levelsInQueue = levels.map(x => x.levelId);
      //await room.save();
      return levelToPlay;
    }

    getReplayScore(replay) {
      return (replay - 150) / 10
    }

    getTimeScore(averageTimePerWin) {

      if(averageTimePerWin > 180 || averageTimePerWin < 15) {
        return -10000;
      }

      return 0;
    }

    scoreTags(tags) {
      var score = 0;
      
      let tagScoreSheet = {
        ltag_elite: -10000,
        ltag_newbie: 5,
        ltag_simple: 5,
        ltag_casual: 10,
        ltag_panic: 0,
        ltag_pjp: 0,
        ltag_precise: 10,
        ltag_precarious: 10,
        ltag_electrodongle: 5,
        ltag_secret: 0,
        ltag_intense: 5,
        ltag_choice: 0,
        ltag_raceway: 10,
        ltag_traps: 0,
        ltag_brawler: -100000,
        ltag_eye: 0,
        ltag_paced: 10,
        ltag_puzzle: -100000,
        ltag_bombs: 0,
        ltag_blasters: 0,
        ltag_paths: 0,
        ltag_contraption: -100000,
        ltag_clever: 5,
        ltag_musicbox: 0,
        ltag_chase: -100000,
        ltag_powerup: 0,
        ltag_complex: 0,
        ltag_throwing: 0,
        ltag_explore: 0,
        ltag_switch: 0,
        ltag_igneum: 0,
        ltag_kaizo: 0,
        ltag_dontmove: -100000,
        ltag_juicefusion: 0,
        ltag_quick: 10,
        ltag_long: 0,
        ltag_shop: 0,
        ltag_faceblaster: 0,
        ltag_onescreen: 0,
        ltag_troll: -1000000,
        ltag_teach: 10,
        ltag_boss: 0,
      }

      for(var tag in tags) {
        score += tagScoreSheet[tag] || 0;
      }

      return score * 10;
    }

    async startLevelForRoom(room) {
        var users = (await RoomEntrants.find({ roomId: room._id })).map(x => x.rumpusId);
        let level = (await this.getRandomSpeedrunLevel(room, users));
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

    async handoutAwardsForRoom(room) {
      let entrants = await RoomEntrants.find({ roomId: room._id });
          
        entrants = _.sortBy(entrants.filter(x => !!x.currentBestTime), (x => x.currentBestTime));

        for(var i = 0; i < entrants.length; i++) {
          var user = await User.findById(entrants[i].userId);
          var pos = i;
          for(var x = i; x > 0; x--) {
            if(entrants[i].currentBestTime == entrants[x].currentBestTime) {
              pos = x;
            } else {
              break;
            }
          }

          entrants[i].points += entrants.length - pos;
          user.raceRecords.points += entrants.length - pos;
          user.currentRaceRecords.points += entrants.length - pos;
          user.markModified('currentRaceRecords');
          user.markModified('raceRecords');

          if(pos == 0) {
            if(!entrants[i].golds) {
              entrants[i].golds = 0;
            }
            entrants[i].golds++;
            user.raceRecords.golds++;
            user.currentRaceRecords.golds++;

            
          } else if (pos==1) {
            if(!entrants[i].silvers) {
              entrants[i].silvers = 0;
            }
            entrants[i].silvers++;
            user.raceRecords.silvers++;
            user.currentRaceRecords.silvers++;
            
          } else if(pos==2) {
            if(!entrants[i].bronzes) {
              entrants[i].bronzes = 0;
            }
            entrants[i].bronzes++;
            user.raceRecords.bronzes++;
            user.currentRaceRecords.bronzes++;
          }
          await entrants[i].save();
          await user.save();
        }
    }

    async startDowntimeForRoom(room) {

        
        await this.handoutAwardsForRoom(room);
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