
export const endPoints = {
    
    //Contests
    GET_ALL_CONTESTS: '/api/contests',
    GET_ACTIVE_CONTESTS: '/api/contests/active',
    GET_CONTEST: (contestId) => `/api/contests/${contestId}`,
    CREATE_CONTEST: '/api/contests',
    UPDATE_RESULTS_CACHE: (contestId) =>  `/api/contests/update-results-cache/${contestId}`,
    GET_CONTEST_RESULTS: (contestId) => `/api/contests/results/${contestId}`,
    GET_CONTEST_TOP_SCORES: (contestId) => `/api/contests/top-scores/${contestId}`,
    VALIDATE_LEVELS: `/api/contests/validate-levels`,
    

    //Submissions
    GET_SUMISSIONS_FOR_CONTEST: (contestId) => `/api/submissions/${contestId}`,
    GET_SUBMISSION: (submisionId) => `/api/submissions/${submisionId}`,
    CREATE_SUBMISSION: '/api/submissions',
    BOOKMARK_SUBMISSION: '/api/submissions/bookmark',

    //User Actions
    GET_VOTES: (contestId, discordId) => `/api/votes/${contestId}/${discordId}`,
    VOTE: '/api/votes',
    UNVOTE: '/api/votes/remove',

    //Profile
    GET_DISCORD_LOGIN_LINK: '/api/users/discord-auth',
    GET_USER: (discordId) => `api/users/${discordId}`,
    CREATE_UPDATE_USER: '/api/users',
    SAVE_PROFILE: (id) => `/api/users/update-key/${id}`,
    LOGIN: '/api/users/login',
}