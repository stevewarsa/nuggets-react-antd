import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useCallback, useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {PassageUtils} from "../helpers/passage-utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Menu, Row, Select, Space} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined, LinkOutlined,
    MoreOutlined
} from "@ant-design/icons";
import {Constants} from "../model/constants";
import {stateActions} from "../store";
import {VerseSelectionRequest} from "../model/verse-selection-request";
import {useNavigate} from "react-router-dom";

const BrowseNuggets = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const startingPassageId = useSelector((state: AppState) => state.startingPassageId);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [nuggetIdList, setNuggetIdList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPassage, setCurrentPassage] = useState(undefined);
    const [selectedTranslation, setSelectedTranslation] = useState("niv");
    const {Option} = Select;

    useEffect(() => {
        if (prefs) {
            setSelectedTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving nugget list from server..."});
            const nuggetIdListResponse = await memoryService.getNuggetIdList(user);
            const nuggetIdList = nuggetIdListResponse.data;
            PassageUtils.shuffleArray(nuggetIdList);
            setNuggetIdList(nuggetIdList);
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    useEffect(() => {
        if (startingPassageId !== -1) {
            // console.log("useEffect [startingPassageId, nuggetIdList] - current nugget list:", nuggetIdList);
            const foundIndex = nuggetIdList.findIndex(nugget => nugget.nuggetId === startingPassageId);
            // console.log("useEffect [startingPassageId, nuggetIdList] - startingPassageId: " + startingPassageId + ", foundIndex: " + foundIndex);
            setCurrentIndex(foundIndex);
        } else {
            setCurrentIndex(0);
        }
    }, [startingPassageId, nuggetIdList]);

    const retrievePassage = useCallback(async () => {
        if (!nuggetIdList || currentIndex > (nuggetIdList.length - 1) || currentIndex < 0) {
            return;
        }
        // console.log("Current Index: " + currentIndex);
        let passageId: number = parseInt(nuggetIdList[currentIndex].nuggetId);
        setBusy({state: true, message: "Retrieving passage text..."});
        const passageResponse = await memoryService.getPassageById(passageId, selectedTranslation, user);
        setCurrentPassage(passageResponse.data);
        setBusy({state: false, message: ""});
    }, [nuggetIdList, currentIndex, selectedTranslation, user]);

    const handleNext = () => {
        setCurrentIndex(PassageUtils.getNextIndex(currentIndex, nuggetIdList.length, true));
    };

    const handlePrev = () => {
        setCurrentIndex(PassageUtils.getNextIndex(currentIndex, nuggetIdList.length, false));
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // console.log("handleMenuClick - Here are the verses for selection:");
            // console.log(formattedVersesAsArray);
            dispatcher(stateActions.setVerseSelectionRequest({passage: currentPassage, actionToPerform: "copy", backToPath: "/browseNuggets"} as VerseSelectionRequest));
            navigate("/selectVerses");
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currentPassage);
        }
    };

    const handleTranslationChange = (value) => {
        setSelectedTranslation(value);
    };

    useEffect(() => {
        retrievePassage();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [selectedTranslation, retrievePassage, currentIndex, nuggetIdList]);

    return (
        <>
            <Row justify="center">
                <h1>Browse Bible</h1>
            </Row>
            {busy.state &&
                <Row justify="center">
                    <SpinnerTimer message={busy.message}/>;
                </Row>
            }
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                {nuggetIdList && nuggetIdList.length > 0 &&
                    <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                        <Col>{currentIndex + 1} of {nuggetIdList.length}</Col>
                    </Row>
                }
                <Row justify="center" style={{marginBottom: "8px"}}>
                    <Space>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Select style={{width: "100%"}} size="large" value={selectedTranslation} onChange={handleTranslationChange}>
                            <Option value="N/A">{"--Select Translation--"}</Option>
                            {Constants.translationsShortNms.map(trans => (
                                    <Option key={trans.code} value={trans.code}>{trans.translationName}</Option>
                                )
                            )}
                        </Select>
                        <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                        <Col span={6}>
                            <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick}>
                                    <Menu.Item key="1" icon={<CopyOutlined/>}>
                                        Copy
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<LinkOutlined />}>
                                        Interlinear View
                                    </Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined style={{
                                    borderStyle: "solid",
                                    borderWidth: "thin",
                                    borderColor: "gray",
                                    padding: "7px",
                                    backgroundColor: "white"
                                }}/>
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {currentPassage && (
                    <>
                        <p className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(currentPassage, currentIndex + 1, nuggetIdList.length, Constants.translationsShortNms.filter(t => t.code === currentPassage.bookName).map(t => t.translationName)[0], true, false, null)}}/>
                        <p style={{marginTop: "10px"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(currentPassage, true)}}/>
                    </>
                )}

            </Swipe>
        </>
    );
};

export default BrowseNuggets;