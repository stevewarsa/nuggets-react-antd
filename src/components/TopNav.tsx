import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {useState} from "react";
import {Button, Drawer, Image, Layout, Menu, MenuProps} from "antd";
import {CookieUtils} from "../helpers/cookie-utils";
import {stateActions} from "../store";
import {MenuOutlined} from "@ant-design/icons";
import styles from "./TopNav.module.css";

const menuItems: MenuProps['items'] = [
    {
        key: 1,
        label: "Main Menu"
    },
    {
        key: 2,
        label: "Practice Setup"
    },
    {
        key: 10,
        label: "Bible Reading Plan"
    },
    {
        key: 11,
        label: "Browse Quotes"
    },
    {
        key: 3,
        label: "Add Quote"
    },
    {
        key: 12,
        label: "Go To Passage By Ref"
    },
    {
        key: 4,
        label: "My Mem Psg List"
    },
    {
        key: 6,
        label: "Bible Search"
    },
    {
        key: 7,
        label: "View Chapter"
    },
    {
        key: 8,
        label: "About"
    }
];

const menuPaths: {[key: number]: string} = {
    1: "/mainMenu",
    2: "/practiceSetup",
    3: "/addQuote",
    4: "/myMemPsgList",
    6: "/bibleSearch",
    7: "/selectChapter",
    8: "/about",
    10: "/bibleReadingPlan",
    11: "/browseQuotes",
    12: "/goToPassage"
};

const TopNav = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const [current, setCurrent] = useState("1");
    const [state, setState] = useState({visible:false});
    const {Header} = Layout;

    const handleMenuItem = item => {
        setCurrent(item.key);
        setState({visible: false});
        if (item.key === 9) {
            // logout
            CookieUtils.deleteCookie('user.name');
            dispatcher(stateActions.setUser(null));
            navigate("/")
        } else {
            const path = menuPaths[item.key];
            dispatcher(stateActions.setSelectedMenuItem(item.key));
            navigate(path);
        }
    };
    const showDrawer = () => {
        setState({visible:true});
    };

    const onClose = () => {
        setState({visible:false});
    };

    return (
        <Header style={{paddingLeft: "0px", paddingRight: "0px", backgroundColor: "white"}}>
            <div style={{
                float: 'left',
                backgroundColor: "white"
            }}>
                <Image src="goldnuggeticon.png" width={65} height={65} alt="logo"/>
            </div>
            <>
                <Button className={styles.menubtn} type="primary" shape="circle" icon={<MenuOutlined />} onClick={showDrawer}>

                </Button>
                <Drawer title={<Image src="goldnuggeticon.png" width={65} height={65} alt="logo" />} placement="right" onClose={onClose} open={state.visible}>
                    <div style={{display:'flex', flexDirection:"column", backgroundColor: "white"}}>
                        {menuItems.map((item: {key: number, label: string}) => (
                            <Button key={item.key} type="text" onClick={() => handleMenuItem(item)}>{item.label}</Button>
                        ))}
                    </div>
                </Drawer>
            </>
            <Menu className={styles.bigmenu} onClick={handleMenuItem} items={menuItems} theme="light" mode="horizontal" selectedKeys={[current]}
                  overflowedIndicator={<MenuOutlined/>}/>
        </Header>
    );
};

export default TopNav;