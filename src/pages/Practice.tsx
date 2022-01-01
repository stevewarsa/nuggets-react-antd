import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

const Practice = () => {
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    console.log("Here is the practice config from the store:");
    console.log(practiceConfig);
    // TODO - use effect here to grab the memory verses from the store based on the practice config...
    return <h3>Practice Component</h3>
};

export default Practice;