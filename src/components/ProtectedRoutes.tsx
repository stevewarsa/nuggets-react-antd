import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import {Outlet} from "react-router";
import {Navigate, useLocation} from "react-router-dom";

const ProtectedRoutes = () => {
    const location = useLocation();
    const user = useSelector((state: AppState) => state.user);
    if (StringUtils.isEmpty(user)) {
        // not logged in
        return <Navigate to="/login" replace state={{from: location}}/>;
    } else {
        // logged in
        return <Outlet/>
    }
};

export default ProtectedRoutes;