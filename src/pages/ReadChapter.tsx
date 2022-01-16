import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Button, Col, Dropdown, Menu, notification, Row, Select, Space} from "antd";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Passage} from "../model/passage";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined, LinkOutlined, MoreOutlined
} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import {Constants} from "../model/constants";
import {stateActions} from "../store";

const ReadChapter = () => {
    const dispatcher = useDispatch();
    const chapterConfig = useSelector((state: AppState) => state.chapterSelection);
    const {Option} = Select;
    const [currPassage, setCurrPassage] = useState<Passage>(null);
    console.log("ReadChapter component - here is the chapter config:");
    console.log(chapterConfig);
    useEffect(() => {
        const callServer = async () => {
            const chapterResponse = await memoryService.getChapter(chapterConfig.book, chapterConfig.chapter, chapterConfig.translation);
            (chapterResponse.data as Passage).translationId = (chapterResponse.data as Passage).translationName = chapterConfig.translation;
            console.log("Here is the chapter received back:");
            console.log(chapterResponse.data);
            setCurrPassage(chapterResponse.data as Passage);
        };
        if (chapterConfig) {
            callServer();
        }
    }, [chapterConfig]);

    const handleNext = () => {
        dispatcher(stateActions.nextChapter())
    };

    const handlePrev = () => {
        dispatcher(stateActions.prevChapter())
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // copy
            notification.info({message: PassageUtils.copyPassageToClipboard(currPassage) + " copied!", placement: "bottomRight"})
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currPassage);
        }
    };

    const handleTranslationChange = (value) => {
        dispatcher(stateActions.setChapterSelection({...chapterConfig, translation: value}));
    };

    return (
        <>
            <Row justify="center">
                <h1>Read Chapter</h1>
            </Row>
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                <Row justify="center">
                    <Space>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Select style={{width: "100%"}} size="large" value={chapterConfig.translation} onChange={handleTranslationChange}>
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
                                }} />
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {currPassage && (
                    <>
                    <p className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(currPassage, -1, 0, Constants.translationsShortNms.filter(t => t.code === currPassage.bookName).map(t => t.translationName)[0], false, false, null)}}/>
                    <p style={{marginTop: "10px"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(currPassage, true)}}/>
                    </>
                    )
                }
            </Swipe>
        </>
    );
};

export default ReadChapter;