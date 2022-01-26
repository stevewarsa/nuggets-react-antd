import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import {Outlet} from "react-router";
import {Navigate, useLocation} from "react-router-dom";
import memoryService from "../services/memory-service";
import {stateActions} from "../store";
import {useEffect, useState} from "react";
import SpinnerTimer from "./SpinnerTimer";

const ProtectedRoutes = () => {
    const location = useLocation();
    const dispatcher = useDispatch();
    const [busy, setBusy] = useState({state: false, message: ""});
    const user = useSelector((state: AppState) => state.user);
    const prefs = useSelector((state: AppState) => state.userPreferences);

    useEffect(() => {
        if (!StringUtils.isEmpty(user) && (!prefs || prefs.length === 0)) {
            // populate the user preferences first
            const callServer = async () => {
                setBusy({state: true, message: "Retrieving preferences from server..."});
                const preferencesResponse = await memoryService.getPreferences(user);
                dispatcher(stateActions.setUserPrefs(preferencesResponse.data));
                setBusy({state: false, message: ""});
            };
            callServer();
        }
    }, [user, prefs]);
    if (StringUtils.isEmpty(user)) {
        // not logged in
        return <Navigate to="/login" replace state={{from: location}}/>;
    } else {
        // logged in
        if (busy.state) {
            return <SpinnerTimer message={busy.message} />;
        } else {
            return <Outlet/>
        }
    }
};

export default ProtectedRoutes;