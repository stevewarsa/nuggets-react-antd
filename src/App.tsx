import {Route, Navigate, Routes, useLocation} from "react-router-dom";
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
import {StringUtils} from "./helpers/string.utils";
import { useNavigate } from 'react-router-dom';

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathAfterLogin = useSelector((appState: AppState) => appState.pathAfterLogin);
    console.log("Here is the location:", location);
    const dispatcher = useDispatch();
    const selectedMenu = useSelector((state: AppState) => state.selectedMenuKey);
    const user = useSelector((state: AppState) => state.user);
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
    useEffect(() => {
        if (StringUtils.isEmpty(user)) {
            if (!StringUtils.isEmpty(location.pathname) && !["/login", "/", "/mainMenu", "/readChapter", "/selectVerses", "/practice"].includes(location.pathname)) {
                console.log("App.useEffect - setting pathAfterLogin to " + location.pathname);
                dispatcher(stateActions.setPathAfterLogin(location.pathname));
            }
        } else {
            // user is logged in, so see if there is a path after login - if so redirect there
            if (!StringUtils.isEmpty(pathAfterLogin)) {
                navigate(pathAfterLogin);
            }
        }
    }, [location.pathname, user, pathAfterLogin]);
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
            <Header>
                <Menu theme="light" mode="horizontal" selectedKeys={[selectedMenu.toString()]} defaultSelectedKeys={['1']}>
                    {menuItems.map(item => (<Menu.Item key={item.key} onClick={() => handleMenuItem(item)}>{item.label}</Menu.Item>))}
                </Menu>
            </Header>
            <Content style={{ padding: '0 50px', marginTop: '20px' }}>
                <div className="site-layout-content">
                    <Routes>
                        <Route path="/" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <Navigate to="/mainMenu" />} />
                        <Route path="/login" element={StringUtils.isEmpty(user) ?  <Login/> : <Navigate to="/mainMenu" />}/>
                        <Route path="/mainMenu" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <MainMenu/>}/>
                        <Route path="/about" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <About/>}/>
                        <Route path="/practiceSetup" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <PracticeSetup/>}/>
                        <Route path="/practice" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <Practice/>}/>
                        <Route path="/selectChapter" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <SelectChapter/>}/>
                        <Route path="/readChapter" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <ReadChapter/>}/>
                        <Route path="/bibleReadingPlan" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <BibleReadingPlan/>}/>
                        <Route path="/selectVerses" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <SelectVerses/>}/>
                        <Route path="/browseQuotes" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <BrowseQuotes/>}/>
                        <Route path="/addQuote" element={StringUtils.isEmpty(user) ? <Navigate to="/login" /> : <AddQuote/>}/>
                    </Routes>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Bible Nuggets ©{new Date().getFullYear()} Created by Steve Warsa</Footer>
        </Layout>
    );
}

export default App;
