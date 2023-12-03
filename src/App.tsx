import {Route, Routes, useSearchParams} from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import {Col, Layout, Row} from "antd";
import About from "./pages/About";
import PracticeSetup from "./pages/PracticeSetup";
import Practice from "./pages/Practice";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "./model/AppState";
import {stateActions} from "./store";
import SelectChapter from "./pages/SelectChapter";
import ReadChapter from "./pages/ReadChapter";
import {useEffect, useState} from "react";
import memoryService from "./services/memory-service";
import SelectVerses from "./pages/SelectVerses";
import BibleReadingPlan from "./pages/BibleReadingPlan";
import BrowseQuotes from "./pages/BrowseQuotes";
import AddQuote from "./pages/AddQuote";
import Login from "./pages/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import SearchQuotes from "./pages/SearchQuotes";
import BibleSearch from "./pages/BibleSearch";
import ViewMemoryPracticeHistory from "./pages/ViewMemoryPracticeHistory";
import {StringUtils} from "./helpers/string.utils";
import BrowseNuggets from "./pages/BrowseNuggets";
import MyMemPsgList from "./pages/MyMemPsgList";
import SpinnerTimer from "./components/SpinnerTimer";
import TopicList from "./pages/TopicList";
import TopNav from "./components/TopNav";
import useMemoryPassages from "./hooks/use-memory-passages";
import GoToPassageByRef from "./pages/GoToPassageByRef";
import MyMemPsgListInOrder from "./pages/MyMemPsgListInOrder";
import MemoryPassagesByBox from "./pages/MemoryPassagesByBox";
import EnterExplanation from "./pages/EnterExplanation";

const App = () => {
    const dispatcher = useDispatch();
    const [searchParams] = useSearchParams();
    const [busy, setBusy] = useState({state: false, message: ""});
    const {getTopicList} = useMemoryPassages();
    const user = useSelector((state: AppState) => state.user);
    const currentQuotesIndex = useSelector((state: AppState) => state.currentQuotesIndex);
    const { Content, Footer } = Layout;

    useEffect(() => {
        (async () => {
            setBusy({state: true, message: "Calling server to get initialization data..."});
            const locMaxChaptersByBook = await memoryService.getMaxChaptersByBook();
            dispatcher(stateActions.setMaxChaptersByBook(locMaxChaptersByBook.data));
            const allUsers = await memoryService.getAllUsers();
            dispatcher(stateActions.setAllUsers(allUsers.data));
            const queryParamMap: {[key: string]: string} = {};
            searchParams.forEach((value, key) => queryParamMap[key] = value);
            console.log("App.useEffect[] - here is the queryParamMap: ", queryParamMap);
            dispatcher(stateActions.setQueryParams(queryParamMap));
            setBusy({state: false, message: ""});
        })();
    }, []);

    useEffect(() => {
        if (!StringUtils.isEmpty(user)) {
            (async () => {
                setBusy({state: true, message: "Loading topic list from DB..."});
                const topics: { id: number, name: string }[] = await getTopicList(user);
                dispatcher(stateActions.setTopicList(topics));
                setBusy({state: false, message: ""});
            })();
        }
    }, [user]);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
    }, [currentQuotesIndex]);

    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <Layout className="layout">
                <TopNav/>
                <Content style={{paddingLeft: "5px", paddingRight: "5px", marginTop: "20px"}}>
                    <Routes>
                        <Route path="/" element={<Login/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route element={<ProtectedRoutes/>}>
                            <Route path="/mainMenu" element={<MainMenu/>}/>
                            <Route path="/about" element={<About/>}/>
                            <Route path="/practiceSetup" element={<PracticeSetup/>}/>
                            <Route path="/practiceHist" element={<ViewMemoryPracticeHistory/>}/>
                            <Route path="/passagesByBox" element={<MemoryPassagesByBox/>}/>
                            <Route path="/practice" element={<Practice/>}/>
                            <Route path="/selectChapter" element={<SelectChapter/>}/>
                            <Route path="/readChapter" element={<ReadChapter/>}/>
                            <Route path="/bibleReadingPlan" element={<BibleReadingPlan/>}/>
                            <Route path="/selectVerses" element={<SelectVerses/>}/>
                            <Route path="/browseQuotes" element={<BrowseQuotes/>}/>
                            <Route path="/browseNuggets" element={<BrowseNuggets/>}/>
                            <Route path="/searchQuotes" element={<SearchQuotes/>}/>
                            <Route path="/bibleSearch" element={<BibleSearch/>}/>
                            <Route path="/addQuote" element={<AddQuote/>}/>
                            <Route path="/myMemPsgList" element={<MyMemPsgList/>}/>
                            <Route path="/myMemPsgListInOrder" element={<MyMemPsgListInOrder/>}/>
                            <Route path="/topicList" element={<TopicList/>}/>
                            <Route path="/goToPassage" element={<GoToPassageByRef/>}/>
                            <Route path="/enterExplanation" element={<EnterExplanation/>}/>
                        </Route>
                    </Routes>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    {!StringUtils.isEmpty(user) &&
                        <Row justify="center">
                            <h3>Current User: {user}</h3>
                        </Row>
                    }
                    <Row justify="center">
                        <Col>
                            Bible Nuggets {new Date().getFullYear()} Created by the Web Master
                        </Col>
                    </Row>
                </Footer>
            </Layout>
        );
    }
}

export default App;
