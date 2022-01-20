import {Redirect, Route, Switch, useHistory} from "react-router-dom";
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

const App = () => {
    const history = useHistory();
    const dispatcher = useDispatch();
    const selectedMenu = useSelector((state: AppState) => state.selectedMenuKey);
    // console.log("App - selectedMenu from store is " + selectedMenu);
    const { Header, Content, Footer } = Layout;
    useEffect(() => {
        const callServer = async () => {
            const locMaxChaptersByBook = await memoryService.getMaxChaptersByBook();
            dispatcher(stateActions.setMaxChaptersByBook(locMaxChaptersByBook.data));
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
        history.push(item.path);
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
                    <Switch>
                        <Route path="/" exact>
                            <Redirect to="/mainMenu"/>
                        </Route>
                        <Route path="/mainMenu" exact>
                            <MainMenu/>
                        </Route>
                        <Route path="/about" exact>
                            <About/>
                        </Route>
                        <Route path="/practiceSetup" exact>
                            <PracticeSetup/>
                        </Route>
                        <Route path="/practice" exact>
                            <Practice/>
                        </Route>
                        <Route path="/selectChapter" exact>
                            <SelectChapter/>
                        </Route>
                        <Route path="/readChapter" exact>
                            <ReadChapter/>
                        </Route>
                        <Route path="/bibleReadingPlan" exact>
                            <BibleReadingPlan/>
                        </Route>
                        <Route path="/selectVerses" exact>
                            <SelectVerses/>
                        </Route>
                        <Route path="/browseQuotes" exact>
                            <BrowseQuotes/>
                        </Route>
                        <Route path="/addQuote" exact>
                            <AddQuote/>
                        </Route>
                    </Switch>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Bible Nuggets ©2022 Created by Steve Warsa</Footer>
        </Layout>
    );
}

export default App;
