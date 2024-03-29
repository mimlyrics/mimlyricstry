import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "./auth/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: "https://mimlyricstest-api.com",
    //baseUrl: "http://localhost:5000"
    //credentials: 'include',
    prepareHeaders: (headers, {getState}) => {
        const token = getState().auth.token;
        //console.log("Heyyy token: ", token);
        if(token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers;
    }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if(result?.error?.originalStatus === 403) {
        console.log('sending refresh token');
        const refreshResult = await baseQuery('/refresh', api, extraOptions);
        console.log(refreshResult);
        if(refreshResult?.data) {
            const userInfo = api.getState().auth.userInfo;
            // store the new token
            api.dispatch(setCredentials({...refreshResult.data, userInfo}));
            // retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        }else {
            api.dispatch(logout());
        }
    }
    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (builder) => ({

    })
})