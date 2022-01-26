import {Route, Routes} from "react-router-dom";
import 'antd/dist/antd.css';
import MainMenu from "./pages/MainMenu";
import {Layout, Menu} from "antd";
import About from "./pages/About";
import PracticeSetup from "./pages/PracticeSetup";
import Practice from "./pages/Practice";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "./model/AppState";
import {stateActions} from "./store";
import SelectChapter from "./pages/SelectChapter";
import ReadChapter from "./pages/ReadChapter";
import {useEffect} from "react";
import memoryService from "./services/memory-service";
import SelectVerses from "./pages/SelectVerses";
import BibleReadingPlan from "./pages/BibleReadingPlan";
import BrowseQuotes from "./pages/BrowseQuotes";
import AddQuote from "./pages/AddQuote";
import Login from "./pages/Login";
import { useNavigate } from 'react-router-dom';
import ProtectedRoutes from "./components/ProtectedRoutes";
import SearchQuotes from "./pages/SearchQuotes";
import BibleSearch from "./pages/BibleSearch";
import {PassageUtils} from "./helpers/passage-utils";

const App = () => {
    const navigate = useNavigate();
    //console.log("Here is the location:", location);
    const dispatcher = useDispatch();
    const selectedMenu = useSelector((state: AppState) => state.selectedMenuKey);
    // console.log("App - selectedMenu from store is " + selectedMenu);
    const { Header, Content, Footer } = Layout;
    useEffect(() => {
        const callServer = async () => {
            const locMaxChaptersByBook = await memoryService.getMaxChaptersByBook();
            dispatcher(stateActions.setMaxChaptersByBook(locMaxChaptersByBook.data));
            const allUsers = await memoryService.getAllUsers();
            dispatcher(stateActions.setAllUsers(allUsers.data));

        };
        callServer();

    }, [dispatcher]);
    const menuItems = [
        {
            key: 1,
            label: "Main Menu",
            path: "/mainMenu"
        },
        {
            key: 2,
            label: "Practice Setup",
            path: "/practiceSetup"
        },
        {
            key: 3,
            label: "Add Quote",
            path: "/addQuote"
        },
        {
            key: 4,
            label: "My Mem Psg List",
            path: "/myPassageList"
        },
        {
            key: 5,
            label: "Search/Add",
            path: "/searchOrAdd"
        },
        {
            key: 6,
            label: "Bible Search",
            path: "/bibleSearch"
        },
        {
            key: 7,
            label: "View Chapter",
            path: "/selectChapter"
        },
        {
            key: 8,
            label: "About",
            path: "/about"
        },
        {
            key: 9,
            label: "Logout",
            path: "/logout"
        }
    ];

    const handleMenuItem = (item: {key: number, label: string, path: string}) => {
        // console.log(item.label);
        navigate(item.path);
        dispatcher(stateActions.setSelectedMenuItem(item.key));
    }

    return (
        <Layout className="layout">
            <Header style={{paddingLeft: "0px", paddingRight: "0px"}}>
                <Menu theme="light" mode="horizontal" selectedKeys={[selectedMenu.toString()]} defaultSelectedKeys={['1']}>
                    {menuItems.map(item => <Menu.Item key={item.key} onClick={() => handleMenuItem(item)}>{item.label}</Menu.Item>)}
                </Menu>
            </Header>
            <Content style={{ paddingLeft: "5px", paddingRight: "5px", marginTop: "20px" }}>
                <div className="site-layout-content">
                    <Routes>
                        <Route path="/" element={<Login/>} />
                        <Route path="/login" element={<Login/>}/>
                        <Route element={<ProtectedRoutes/>}>
                            <Route path="/mainMenu" element={<MainMenu/>}/>
                            <Route path="/about" element={<About/>}/>
                            <Route path="/practiceSetup" element={<PracticeSetup/>}/>
                            <Route path="/practice" element={<Practice/>}/>
                            <Route path="/selectChapter" element={<SelectChapter/>}/>
                            <Route path="/readChapter" element={<ReadChapter/>}/>
                            <Route path="/bibleReadingPlan" element={<BibleReadingPlan/>}/>
                            <Route path="/selectVerses" element={<SelectVerses/>}/>
                            <Route path="/browseQuotes" element={<BrowseQuotes/>}/>
                            <Route path="/searchQuotes" element={<SearchQuotes/>}/>
                            <Route path="/bibleSearch" element={<BibleSearch/>}/>
                            <Route path="/addQuote" element={<AddQuote/>}/>
                        </Route>
                    </Routes>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Bible Nuggets ©{new Date().getFullYear()} Created by Steve Warsa</Footer>
        </Layout>
    );
}

export default App;
