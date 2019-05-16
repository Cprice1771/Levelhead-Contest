
export const endPoints = {
    
    //Contests
    GET_ALL_CONTESTS: '/api/contests',
    GET_CONTEST: (contestId) => `/api/contests/${contestId}`,
    CREATE_CONTEST: '/api/contests',

    GET_CONTEST_RESULTS: (contestId) => `/api/contests/results/${contestId}`,

    //Submissions
    GET_SUMISSIONS_FOR_CONTEST: (contestId) => `/api/submissions/${contestId}`,
    GET_SUBMISSION: (submisionId) => `/api/submissions/${submisionId}`,
    CREATE_SUBMISSION: '/api/submissions',

    //User Actions
    GET_VOTES: (contestId, discordId) => `/api/votes/${contestId}/${discordId}`,
    VOTE: '/api/votes',
    UNVOTE: '/api/votes/remove',

    //Profile
    GET_DISCORD_LOGIN_LINK: '/api/users/discord-auth',
    GET_USER: (discordId) => `api/users/${discordId}`,
    CREATE_UPDATE_USER: '/apu/users',
    LOGIN: '/api/users/login',
}