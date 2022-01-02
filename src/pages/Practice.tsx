import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import {stateActions} from "../store";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";

const Practice = () => {
    const dispatch = useDispatch();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memPassageList = useSelector((state:AppState) => state.memPassageList);
    console.log("Here is the practice config from the store:");
    console.log(practiceConfig);
    const [busy, setBusy] = useState({state: false, message: ""});
    // TODO - use effect here to grab the memory verses from the server based on the practice config...
    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Loading memory passages from DB..."});
            const locMemoryPassagesData: any = await memoryService.getMemoryPsgList()
            dispatch(stateActions.setMemPassageList(locMemoryPassagesData.data));
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [dispatch]);
    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            <h3>Practice Component ({memPassageList.length} passages)</h3>
        </>
    );
};

export default Practice;