import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import {Outlet} from "react-router";
import {Navigate, useLocation, useSearchParams} from "react-router-dom";
import memoryService from "../services/memory-service";
import {stateActions} from "../store";
import {useEffect, useState} from "react";
import SpinnerTimer from "./SpinnerTimer";
import {Constants} from "../model/constants";
import {CookieUtils} from "../helpers/cookie-utils";
import {useIsMounted} from "../hooks/is-mounted";

const ProtectedRoutes = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const dispatcher = useDispatch();
    const isMounted = useIsMounted();
    const [busy, setBusy] = useState({state: false, message: ""});
    const user = useSelector((state: AppState) => state.user);
    const prefs = useSelector((state: AppState) => state.userPreferences);

    useEffect(() => {
        if (!StringUtils.isEmpty(user) && (!prefs || prefs.length === 0)) {
            // populate the user preferences first
            (async () => {
                setBusy({state: true, message: "Retrieving preferences from server..."});
                const preferencesResponse = await memoryService.getPreferences(user);
                dispatcher(stateActions.setUserPrefs(preferencesResponse.data));
                if (isMounted.current) {
                    setBusy({state: false, message: ""});
                }
            })();
        }
    }, [user, prefs]);

    const bypass = "true" === searchParams.get("bypass");
    if (StringUtils.isEmpty(user)) {
        if (bypass && StringUtils.isEmpty(CookieUtils.getCookie("user.name"))) {
            dispatcher(stateActions.setUser(Constants.GUEST_USER));
            return <Outlet/>;
        } else {
            // not logged in
            return <Navigate to="/login" replace state={{from: location}}/>;
        }
    } else {
        // logged in
        if (busy.state) {
            return <SpinnerTimer message={busy.message}/>;
        } else {
            return <Outlet/>;
        }
    }
};

export default ProtectedRoutes;