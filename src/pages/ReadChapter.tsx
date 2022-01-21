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
import {useNavigate} from "react-router-dom";
import {VerseSelectionRequest} from "../model/verse-selection-request";
import copy from "copy-to-clipboard";

const ReadChapter = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const chapterConfig = useSelector((state: AppState) => state.chapterSelection);
    const verseSelectionRequest = useSelector((state: AppState) => state.verseSelectionRequest);
    const {Option} = Select;
    const [currPassage, setCurrPassage] = useState<Passage>(null);
    // const [verseSelectionRequestSent, setVerseSelectionRequestSent] = useState(false);
    // console.log("ReadChapter component - here is the chapter config:");
    // console.log(chapterConfig);

    useEffect(() => {
        if (verseSelectionRequest) {
            // console.log("useEffect - here's the verseSelectionRequest sent back to me, and following that will be the current passage:");
            // console.log(verseSelectionRequest);
            const selectedVerses = verseSelectionRequest.versesForSelection.filter(v => v.selected);
            if (selectedVerses.length === 1 || selectedVerses.length === 2) {
                const passage = new Passage();
                passage.startVerse = selectedVerses[0].verseNum;
                passage.endVerse = selectedVerses.length === 1 ? passage.startVerse : selectedVerses[1].verseNum;
                passage.bookName = chapterConfig.book;
                passage.translationName = chapterConfig.translation;
                passage.chapter = chapterConfig.chapter;
                const psgRef = PassageUtils.getPassageStringNoIndex(passage, true, true);
                let clipboardString = psgRef + "\n\n";
                for (let verse of verseSelectionRequest.versesForSelection) {
                    if (verse.verseNum >= passage.startVerse && verse.verseNum <= passage.endVerse) {
                        clipboardString += verse.plainText;
                    }
                }
                copy(clipboardString);
                notification.info({message: psgRef + " copied!", placement: "bottomRight"});
            }
        }
    }, [verseSelectionRequest, chapterConfig.book, chapterConfig.chapter, chapterConfig.translation]);

    useEffect(() => {
        const callServer = async () => {
            const chapterResponse = await memoryService.getChapter(chapterConfig.book, chapterConfig.chapter, chapterConfig.translation);
            (chapterResponse.data as Passage).translationId = (chapterResponse.data as Passage).translationName = chapterConfig.translation;
            // console.log("Here is the chapter received back:");
            // console.log(chapterResponse.data);
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
            const formattedVersesAsArray = PassageUtils.getFormattedVersesAsArray(currPassage, []);
            // console.log("handleMenuClick - Here are the verses for selection:");
            // console.log(formattedVersesAsArray);
            dispatcher(stateActions.setVerseSelectionRequest({versesForSelection: formattedVersesAsArray, actionToPerform: "copy", backToPath: "/readChapter"} as VerseSelectionRequest));
            navigate("/selectVerses");
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