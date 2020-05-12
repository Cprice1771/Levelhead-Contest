const _ = require('lodash');
const Config = require('../models/config');
const Axios = require('axios');
const Contest  = require('../models/contest');
const Submission = require('../models/submission');
const rateLimit = require('./AxiosRateLimit')
const Season = require('../models/Speedrun/Season');
const UserScore = require('../models/Speedrun/userScore');

class RumpusAPI {

    constructor() {

        this.getClient = this.getClient.bind(this);
        this.bulkGetLevels = this.bulkGetLevels.bind(this);
        this.bulkGetUsers = this.bulkGetUsers.bind(this);
        this.getLevel = this.getLevel.bind(this);
        this.DelegationKeyPermissions = this.DelegationKeyPermissions.bind(this);
        this.getUrlParams = this.getUrlParams.bind(this);
        this.searchLevels = this.searchLevels.bind(this);
    }

    getUrlParams(searchParams) {
      let params= '';
      for(let param in searchParams) {
        if(Array.isArray(searchParams[param])) {
          params += `${param}=${searchParams[param].join(',')}&`
        } else {
          params += `${param}=${searchParams[param]}&`
        }
      }
      
      if(params.length > 0) {
        params = params.slice(0, -1);
      }

      return params;
  }

  
    
    async getClient() {

      if(!this.client) {
        
        let cfg = await Config.findOne();
        this.client = rateLimit(Axios.create({
        baseURL: 'https://www.bscotch.net/api/',  
        timeout: 5000,
        headers: {
            'Rumpus-Delegation-Key' : cfg.key
        }
        }), {  maxRequests: 500, perMilliseconds: 300000});
        this.levelcupKey = cfg.key;
      }

      this.client.defaults.headers['Rumpus-Delegation-Key'] = this.levelcupKey;
      return this.client;
    }

    async searchLevels(searchParams) {
      const httpClient = await this.getClient();
      const params = this.getUrlParams(searchParams);
      //console.log(`levelhead/levels?${params}`);
      let resp = (await httpClient.get(`levelhead/levels?${params}`));
     
      return resp.data.data;
  }

  async DelegationKeyPermissions(apiKey) {
      const httpClient = await this.getClient();
      httpClient.defaults.headers['Rumpus-Delegation-Key'] = apiKey;
      return (await httpClient.get(`delegation/keys/@this`)).data.data;
  }

    async bulkGetLevels(levelIds) {
       
        const httpClient = await this.getClient();
        let newLevelData = [];
        while(levelIds.length > 0) {
          let toGet = levelIds.splice(0, Math.min(16, levelIds.length));
          let levelResults = (await httpClient.get(`levelhead/levels?levelIds=${toGet.join(',')}&limit=64&includeStats=true&includeRecords=true&includeAliases=true`)).data.data;
          newLevelData = newLevelData.concat(levelResults);
        }
    
        return newLevelData;
    }
  
    async bulkGetUsers(users) {
      const httpClient = await this.getClient();
    
      let mappedUsers = [];
      while(users.length > 0) {
        let toGet = users.splice(0, Math.min(64, users.length));
        let userReuslt = (await httpClient.get(`levelhead/aliases?userIds=${toGet.join(',')}`)).data.data;
        mappedUsers = mappedUsers.concat(userReuslt);
      }
    
      return mappedUsers;
    }

    async getLevel(levelId) {
      const httpClient = await this.getClient();
      let levels = (await httpClient.get(`levelhead/levels?levelIds=${levelId}&limit=1&includeStats=true&includeRecords=true&includeAliases=true`)).data.data; //don't ask....
      if(levels.length < 1) {
        return null;
      }

      return levels[0];
    }

    async getUser(userId) {
      const httpClient = await this.getClient();
      let users = (await httpClient.get(`levelhead/aliases?userIds=${userId}`)).data.data; //don't ask....
      if(users.length < 1) {
        return null;
      } 

      return users[0]
    }
    
    
    async bookmarkLevel(lookupCode, apiKey) {

      const httpClient = await this.getClient();
      httpClient.defaults.headers['Rumpus-Delegation-Key'] = apiKey;
      
      return (await httpClient.put(`levelhead/bookmarks/${lookupCode}`));
    }

    async getRecentRecords(recordType, params) {
      const httpClient = await this.getClient();
      const formattedParams = this.getUrlParams(params);
      return (await httpClient.get(`levelhead/recent-records/${recordType}?${formattedParams}`)).data.data;
    }

    

}

module.exports = new RumpusAPI();