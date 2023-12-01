import React from 'react';
import {
    AimOutlined,
    CheckCircleOutlined,
    LinkOutlined,
    ReadOutlined,
    SearchOutlined,
    SketchOutlined
} from "@ant-design/icons";
import {Collapse, List, notification, Space} from "antd";
import {useNavigate} from "react-router-dom";
import memoryService from "../services/memory-service";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

const MainMenu = () => {
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const { Panel } = Collapse;
    const menuItems = [
        {
            key: "1",
            title: "Read",
            icon: (<ReadOutlined />),
            desc: "In this section, you can search read the full Bible, or you can just read selected passages from the Bible",
            items: [
                {
                    key: "1.1",
                    label: "Read a Chapter",
                    action: "/selectChapter"
                },
                {
                    key: "1.5",
                    label: "Bible Reading Plan",
                    action: "/bibleReadingPlan"
                }
            ]
        },
        {
            key: "2",
            title: "Search",
            icon: (<SearchOutlined />),
            desc: "In this section, you can search the full bible for any word or phrase, including wildcards. The search can be performed in the Old Testament, New Testament or the Full Bible, or you can limit the search to a particular book of the Bible. Additionally, you can search any of the supported translations of the Bible.",
            items: [
                {
                    key: "2.1",
                    label: "Bible Search",
                    action: "/bibleSearch"
                },
                {
                    key: "2.2",
                    label: "Go To Passage By Ref",
                    action: "/goToPassage"
                }
            ]
        },
        {
            key: "3",
            title: "Nuggets",
            icon: (<SketchOutlined />),
            desc: "Nuggets are passages from the Bible consisting of 1 or more verses and up to a whole chapter.  These are passages you can just randomly browse if you're looking to get a quick bit of Bible reading in and don't know where to start.",
            items: [
                {
                    key: "3.1",
                    label: "Browse Bible",
                    action: "/browseNuggets"
                },
                {
                    key: "3.2",
                    label: "Browse Quotes",
                    action: "/browseQuotes"
                },
                {
                    key: "3.3",
                    label: "Add Quote",
                    action: "/addQuote"
                },
                {
                    key: "3.4",
                    label: "Search Quotes",
                    action: "/searchQuotes"
                },
                {
                    key: "3.5",
                    label: "Browse By Topic",
                    action: "/topicList"
                }
            ]
        },
        {
            key: "4",
            title: "Devotionals & Links",
            icon: (<LinkOutlined />),
            desc: "Here are some links that are good spiritual resources for the Christian",
            items: [
                {
                    key: "4.1",
                    label: "Valley of Vision",
                    action: "https://banneroftruth.org/us/valley/"
                },
                {
                    key: "4.2",
                    label: "Spurgeon Morning & Evening",
                    action: "http://biblegateway.com/devotionals/morning-and-evening/today"
                },
                {
                    key: "4.3",
                    label: "Grace Gems",
                    action: "http://gracegems.org/"
                },
                {
                    key: "4.4",
                    label: "Got Questions",
                    action: "http://www.gotquestions.net/getrandompage.asp?websiteid=1"
                },
                {
                    key: "4.5",
                    label: "J.C. Ryle",
                    action: "http://gracegems.org/Ryle"
                },
                {
                    key: "4.6",
                    label: "Our Daily Bread",
                    action: "http://odb.org"
                },
                {
                    key: "4.7",
                    label: "Plugged In Movie Reviews",
                    action: "http://www.pluggedin.com"
                }
            ]
        },
        {
            key: "5",
            title: "Memorize",
            icon: (<AimOutlined />),
            desc: "This section is used for various tasks related to Bible or other memorization",
            items: [
                {
                    key: "5.1",
                    label: "Practice",
                    action: "/practiceSetup"
                },
                {
                    key: "5.2",
                    label: "Practice History",
                    action: "/practiceHist"
                },
                {
                    key: "5.3",
                    label: "My Mem Passages",
                    action: "/myMemPsgList"
                },
                {
                    key: "5.4",
                    label: "My Mem Passages In Order",
                    action: "/myMemPsgListInOrder"
                },
                {
                    key: "5.5",
                    label: "Mem Passages By Box",
                    action: "/passagesByBox"
                }
            ]
        },
        {
            key: "9",
            title: "Steve's Tasks",
            icon: (<CheckCircleOutlined />),
            desc: "This section is used for tasks that only the creator of this program (Steve) can do",
            items: [
                {
                    key: "9.1",
                    label: "Copy This DB to Guest",
                    action: "/mainMenu"
                }
            ]
        }
    ];
    const handleSelect = async (item: {key: string, label: string, action: string}) => {
        if (item.key === "9.1") {
            // this is copy db to guest
            const copyResponse = await memoryService.copyDbToGuestDb();
            if (copyResponse.data === "success") {
                notification.info({message: "DB copied!", placement: "bottomRight"});
            } else {
                notification.warning({
                    message: "DB NOT copied! Error message: " + copyResponse.data,
                    placement: "bottomRight"
                });
            }
        } else if (item.key.startsWith("4.")) {
            window.open(item.action, "_blank");
        } else {
            navigate(item.action);
        }
    };
    return (
        <Collapse accordion>
            {menuItems.filter(item => item.key !== "9" || (item.key === "9" && user === "SteveWarsa")).map(menuItem => (
                <Panel header={(
                    <Space size="small">
                        {menuItem.icon}
                        <span style={{fontWeight: "bolder"}}>{menuItem.title}</span>
                    </Space>
                )} key={menuItem.key}>
                    <p style={{fontWeight: "bold"}}>{menuItem.desc}</p>
                    <List
                        bordered
                        dataSource={menuItem.items}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </Panel>
                )
            )}
        </Collapse>
    );
}

export default MainMenu;
