import {Redirect, Route, Switch, useHistory} from "react-router-dom";
import 'antd/dist/antd.css';
import MainMenu from "./pages/MainMenu";
import {Breadcrumb, Layout, Menu} from "antd";
import About from "./pages/About";

const App = () => {
    let history = useHistory();
    const { Header, Content, Footer } = Layout;
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
            path: "/chapterSelection"
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
        console.log(item.label);
        history.push(item.path);
    }

    return (
        <Layout className="layout">
            <Header>
                <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
                    {menuItems.map(item => (<Menu.Item key={item.key} onClick={() => handleMenuItem(item)}>{item.label}</Menu.Item>))}
                </Menu>
            </Header>
            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>Main Menu</Breadcrumb.Item>
                </Breadcrumb>
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
                    </Switch>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Bible Nuggets ©2022 Created by Steve Warsa</Footer>
        </Layout>
    );
}

export default App;
