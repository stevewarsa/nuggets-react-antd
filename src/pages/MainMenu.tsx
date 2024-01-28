import React, {useEffect, useState} from 'react';
import {
    AimOutlined,
    CheckCircleOutlined,
    LinkOutlined, SafetyOutlined,
    SearchOutlined,
    SketchOutlined, SubnodeOutlined
} from "@ant-design/icons";
import {Button, Col, Collapse, CollapseProps, Input, List, Modal, notification, Row} from "antd";
import {useNavigate} from "react-router-dom";
import memoryService from "../services/memory-service";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import {stateActions} from "../store";
import SpinnerTimer from "../components/SpinnerTimer";

const links = [
    {
        key: "4.1",
        label: "Valley of Vision",
        action: "https://banneroftruth.org/us/valley/",
        additional: false
    },
    {
        key: "4.2",
        label: "Spurgeon Morning & Evening",
        action: "http://biblegateway.com/devotionals/morning-and-evening/today",
        additional: false
    },
    {
        key: "4.3",
        label: "Grace Gems",
        action: "http://gracegems.org/",
        additional: false
    },
    {
        key: "4.4",
        label: "Got Questions",
        action: "http://www.gotquestions.net/getrandompage.asp?websiteid=1",
        additional: false
    },
    {
        key: "4.5",
        label: "J.C. Ryle",
        action: "http://gracegems.org/Ryle",
        additional: false
    },
    {
        key: "4.6",
        label: "Our Daily Bread",
        action: "http://odb.org",
        additional: false
    },
    {
        key: "4.7",
        label: "Plugged In Movie Reviews",
        action: "http://www.pluggedin.com",
        additional: false
    }
];
const MainMenu = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const additionalLinks = useSelector((state: AppState) => state.additionalLinks);
    const [linkList, setLinkList] =
        useState<{key: string, label: string, action: string, additional: boolean}[]>(links);
    const [showAddLink, setShowAddLink] = useState<boolean>(false);
    const [linkLabel, setLinkLabel] = useState<string>(undefined);
    const [linkAddress, setLinkAddress] = useState<string>(undefined);
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        if (!user) {
            console.log("MainMenu.useEffect[] - user not loaded yet, returning...");
            return;
        }
        (async () => {
            setBusy({state: true, message: "Calling server to get initialization data..."});
            const locAdditionalLinks = await memoryService.getAdditionalLinks(user);
            const modAdditionalLinks: {key: string, label: string, action: string, additional: boolean}[] = locAdditionalLinks.data.map(l => {
                return {...l, additional: true};
            });
            dispatcher(stateActions.setAdditionalLinks(modAdditionalLinks));
            setBusy({state: false, message: ""});
        })();

    }, [user]);

    useEffect(() => {
        if (additionalLinks?.length > 0) {
            const locLinkList = [...links];
            for (const additionalLink of additionalLinks) {
                locLinkList.push(additionalLink);
            }
            console.log("MainMenu.useEffect[additionalLinks] - here is the links that are being set:", locLinkList);
            setLinkList(locLinkList);
        }
    }, [additionalLinks]);

    const handleSelect = async (item) => {
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
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: (<><SearchOutlined />
                    <span style={{fontWeight: "bolder"}}> Read</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>In this section, you can search read the full Bible, or you can just read selected passages from the Bible</p>
                    <List
                        bordered
                        dataSource={[
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
                        ]}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </>,
        },
        {
            key: '2',
            label: (<><SearchOutlined />
                    <span style={{fontWeight: "bolder"}}> Search</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>In this section, you can search the full bible for any word or phrase, including wildcards. The search can be performed in the Old Testament, New Testament or the Full Bible, or you can limit the search to a particular book of the Bible. Additionally, you can search any of the supported translations of the Bible.</p>
                    <List
                        bordered
                        dataSource={[
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
                        ]}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </>,
        },
        {
            key: '3',
            label: (<><SketchOutlined />
                    <span style={{fontWeight: "bolder"}}> Nuggets</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>Nuggets are passages from the Bible consisting of 1 or more verses and up to a whole chapter.  These are passages you can just randomly browse if you're looking to get a quick bit of Bible reading in and don't know where to start.</p>
                    <List
                        bordered
                        dataSource={[
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
                        ]}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </>,
        },
        {
            key: '4',
            label: (<><LinkOutlined />
                    <span style={{fontWeight: "bolder"}}> Devotionals & Links</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>Spiritual and other links and resources that have been found useful</p>
                    <Button style={{marginBottom: "5px"}} type="primary" onClick={() => setShowAddLink(true)}>Add Link</Button>
                    <List
                        bordered
                        dataSource={linkList}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label} {item.additional ? <SubnodeOutlined style={{color: "red"}} /> : <SafetyOutlined />}
                            </List.Item>
                        )}
                    />
                </>,
        },
        {
            key: '5',
            label: (<><AimOutlined />
                    <span style={{fontWeight: "bolder"}}> Memorize</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>This section is used for various tasks related to Bible or other memorization</p>
                    <List
                        bordered
                        dataSource={[
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
                            },
                            {
                                key: "5.6",
                                label: "Practice By Book",
                                action: "/practiceByBook"
                            },
                            {
                                key: "5.7",
                                label: "Memory Stats",
                                action: "/memoryStats"
                            }
                        ]}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </>,
        },
        {
            key: '9',
            label: (<><CheckCircleOutlined />
                    <span style={{fontWeight: "bolder"}}> Steve's Tasks</span>
                    </>),
            children:
                <>
                    <p style={{fontWeight: "bold"}}>This section is used for tasks that only the creator of this program (Steve) can do</p>
                    <List
                        bordered
                        dataSource={[
                            {
                                key: "9.1",
                                label: "Copy This DB to Guest",
                                action: "/mainMenu"
                            }
                        ]}
                        renderItem={item => (
                            <List.Item key={item.key} style={{cursor: "pointer"}} onClick={() => handleSelect(item)}>
                                {item.label}
                            </List.Item>
                        )}
                    />
                </>,
        }
    ];

    const handleAddLink = async () => {
        const lastLinkKey = parseInt(linkList[linkList.length - 1].key.split(".")[1]);
        const linkToAdd = {
            user: user,
            key: "4." + (lastLinkKey + 1),
            label: linkLabel,
            action: linkAddress
        };
        const addLinkResponse = await memoryService.addAdditionalLink(linkToAdd);
        if (addLinkResponse.data === "success") {
            dispatcher(stateActions.addLinks(linkToAdd));
        } else {
            Modal.error({
                title: "Error",
                content: "Error adding link: " + addLinkResponse.data,
            });
        }
        setLinkLabel(undefined);
        setLinkAddress(undefined);
        setShowAddLink(false);
    };
    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <>
                <Modal footer={null} title="Add Link" open={showAddLink}
                       onCancel={() => setShowAddLink(false)}>
                    <>
                        <Row style={{marginBottom: "5px"}}>
                            <Col>
                                <Input autoFocus value={linkLabel} placeholder="Link Label"
                                       onChange={evt => setLinkLabel(evt.target.value)}/>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: "10px"}}>
                            <Col>
                                <Input value={linkAddress} placeholder="Link Address"
                                       onChange={evt => setLinkAddress(evt.target.value)}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Button
                                    disabled={StringUtils.isEmpty(linkLabel) || StringUtils.isEmpty(linkAddress)}
                                    type="primary" onClick={handleAddLink}>Add Link</Button>
                            </Col>
                        </Row>
                    </>
                </Modal>
                <Collapse accordion
                          items={items.filter(item => item.key !== "9" || (item.key === "9" && user === "SteveWarsa"))}></Collapse>
            </>
        );
    }
}

export default MainMenu;
