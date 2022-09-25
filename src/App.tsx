import {Route, Routes} from "react-router-dom";
import 'antd/dist/antd.css';
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
//import {Constants} from "./model/constants";
import SpinnerTimer from "./components/SpinnerTimer";
import TopicList from "./pages/TopicList";
import TopNav from "./components/TopNav";

const App = () => {
    //console.log("Here is the location:", location);
    const dispatcher = useDispatch();
    // console.log("App - selectedMenu from store is " + selectedMenu);
    const [busy, setBusy] = useState({state: false, message: ""});
    const user = useSelector((state: AppState) => state.user);
    const { Content, Footer } = Layout;

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Calling server to get initialization data..."});
            const locMaxChaptersByBook = await memoryService.getMaxChaptersByBook();
            dispatcher(stateActions.setMaxChaptersByBook(locMaxChaptersByBook.data));
            const allUsers = await memoryService.getAllUsers();
            dispatcher(stateActions.setAllUsers(allUsers.data));
            // for (let key of Object.keys(Constants.translationLongNames)) {
            //     console.log("Loading max verse by book and chapter for translation: " + key);
            //     const maxVerseByBookChapter = await memoryService.getMaxVerseByBookChapter(key);
            //     dispatcher(stateActions.setMaxVerseByBookChapter({translation: key, maxVerseByBookChapter: maxVerseByBookChapter.data}));
            // }
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [dispatcher]);

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
                            <Route path="/topicList" element={<TopicList/>}/>
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
                            Bible Nuggets ©{new Date().getFullYear()} Created by Steve Warsa
                        </Col>
                    </Row>
                </Footer>
            </Layout>
        );
    }
}

export default App;
