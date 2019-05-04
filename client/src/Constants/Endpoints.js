
export const endPoints = {
    
    //Contests
    GET_ALL_CONTESTS: '/api/contests',
    GET_CONTEST: (contestId) => `/api/contests/${contestId}`,
    CREATE_CONTEST: '/api/contests',

    //Submissions
    GET_SUMISSIONS_FOR_CONTEST: (contestId) => `/api/sumissions/${contestId}`,
    GET_SUBMISSION: (submisionId) => `/api/submissions/${submisionId}`,
    CREATE_SUBMISSION: '/api/submissions'
}