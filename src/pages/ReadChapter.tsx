import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

const ReadChapter = () => {
    const chapterConfig = useSelector((state: AppState) => state.chapterSelection);
    console.log("ReadChapter component - here is the chapter config:");
    console.log(chapterConfig);
    return <h1>Read Chapter</h1>;
};

export default ReadChapter;