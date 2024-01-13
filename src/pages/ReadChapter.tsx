import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Button, Col, Dropdown, Menu, notification, Row, Select, Space} from "antd";
import React, {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Passage} from "../model/passage";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined, FontSizeOutlined,
    LinkOutlined,
    MoreOutlined,
    SubnodeOutlined
} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import {Constants} from "../model/constants";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {VerseSelectionRequest} from "../model/verse-selection-request";
import {StringUtils} from "../helpers/string.utils";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import useMemoryPassages from "../hooks/use-memory-passages";
import UpdateFontSize from "../components/UpdateFontSize";

const ReadChapter = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {updatePreference} = useMemoryPassages();
    const chapterConfig = useSelector((state: AppState) => state.chapterSelection);
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const user = useSelector((state: AppState) => state.user);
    const {Option} = Select;
    const [currPassage, setCurrPassage] = useState<Passage>(null);
    const [currFormattedPassageText, setCurrFormattedPassageText] = useState(null);
    const [chapterIdString, setChapterIdString] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [currentScrollPercent, setCurrentScrollPercent] = useState(0.0);
    const [overrideFontSizeVisible, setOverrideFontSizeVisible] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (!chapterConfig) {
                return;
            }
            const chapterResponse = await memoryService.getChapter(chapterConfig.book, chapterConfig.chapter, chapterConfig.translation);
            const psg: Passage = chapterResponse.data as Passage;
            psg.translationId = psg.translationName = chapterConfig.translation;
            const translFromPrefs = PassageUtils.getPreferredTranslationFromPrefs(prefs, chapterConfig.translation);
            if (chapterConfig.translation !== translFromPrefs) {
                // update the preferred translation in prefs
                await updatePreference(user, "preferred_translation", chapterConfig.translation);
            }
            setCurrPassage(psg);
            setCurrFormattedPassageText(PassageUtils.getFormattedPassageText(psg, true));
            setChapterIdString(chapterConfig.book + "-" + chapterConfig.chapter + "-" + chapterConfig.translation);
        })();
    }, [chapterConfig]);

    useEffect(() => {
        if (!chapterConfig.hasOwnProperty("verse") && !chapterConfig.verse) {
            // scroll to top
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }, [currPassage]);

    useEffect(() => {
        if (!StringUtils.isEmpty(currFormattedPassageText) && chapterConfig.hasOwnProperty("verse") && chapterConfig.verse) {
            // scroll to verse
            const element = document.getElementById("" + chapterConfig.verse);
            if (element) {
                const topPos = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: topPos, // scroll so that the element is at the top of the view
                    behavior: 'smooth' // smooth scroll
                });
            }
        }
    }, [currFormattedPassageText, chapterConfig]);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setCurrentScrollPercent(scrollPercentage);
        });
    }, []);

    // This function will scroll the window to the top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // for smoothly scrolling
        });
    };
    const handleNext = () => {
        dispatcher(stateActions.nextChapter())
    };

    const handlePrev = () => {
        dispatcher(stateActions.prevChapter())
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // copy
            // first, figure out which verses to select based on how far down we're scrolled
            let startIndex = 0;
            let endIndex = currPassage.verses.length - 1;
            let selectVersesFlag = false;
            if (currentScrollPercent > 5 && currentScrollPercent < 90) {
                // we're not at the beginning, and we're not at the end, so try to select the approximate
                //  verse range based on the percentage of scroll
                const targetVerseIndex = (currentScrollPercent / 100.0) *  parseFloat("" + (currPassage.verses.length - 1));
                const targetVerseInt = Math.floor(targetVerseIndex);
                console.log("ReadChapter: currentScrollPercent=" + currentScrollPercent + ", targetVerseIndex=" + targetVerseIndex + ", targetVerseInt=" + targetVerseInt + ", currPassage.verses.length - 1=" + (currPassage.verses.length - 1))
                if (targetVerseInt > 0 && targetVerseInt < currPassage.verses.length - 2) {
                    startIndex = targetVerseInt;
                    endIndex = targetVerseInt + 2;
                    selectVersesFlag = true;
                }
            }
            scrollToTop();
            dispatcher(stateActions.setVerseSelectionRequest({passage: currPassage, actionToPerform: "copy", backToPath: "/readChapter", selectVerses: selectVersesFlag, startIndexToSelect: startIndex, endIndexToSelect: endIndex} as VerseSelectionRequest));
            navigate("/selectVerses");
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currPassage);
        } else if (key === "3") {
            dispatcher(stateActions.setVerseSelectionRequest({passage: currPassage, actionToPerform: "add-to-memory", backToPath: "/practiceSetup", selectVerses: false} as VerseSelectionRequest));
            navigate("/selectVerses");
        } else if (key === "4") {
            setOverrideFontSizeVisible(true);
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
                <UpdateFontSize props={{visible: overrideFontSizeVisible, setVisibleFunction: () => setOverrideFontSizeVisible(false)}}/>
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
                                        Copy...
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<SubnodeOutlined />}>
                                        Add To Memory Verses...
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<LinkOutlined />}>
                                        Interlinear View...
                                    </Menu.Item>
                                    <Menu.Item key="4" icon={<FontSizeOutlined />}>
                                        Override Font...
                                    </Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined style={{
                                    borderStyle: "solid",
                                    borderWidth: "thin",
                                    borderColor: "gray",
                                    padding: "0.5rem",
                                    backgroundColor: "white"
                                }} />
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {currPassage && !StringUtils.isEmpty(currFormattedPassageText) && (
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currFormattedPassageText}
                        >
                            <>
                                <p key={"psg-ref-" + chapterIdString} className="nugget-view" style={{marginTop: "1rem"}} dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(currPassage, -1, 0, Constants.translationsShortNms.filter(t => t.code === currPassage.bookName).map(t => t.translationName)[0], false, false, null)}}/>
                                <p key={"psg-text-" + chapterIdString} style={{marginTop: "1rem"}} className="nugget-view" dangerouslySetInnerHTML={{__html: currFormattedPassageText}}/>
                            </>
                        </CSSTransition>
                    </SwitchTransition>
                    )
                }
            </Swipe>
            {showButton && (
                <>
                    <button onClick={scrollToTop} className="back-to-top">
                        &#8679;
                    </button>
                    <button onClick={() => handleMenuClick({key: "1"})} className="floating-copy">
                        <CopyOutlined/>
                    </button>
                </>
            )}
            {/* &#8679; is used to create the upward arrow */}
        </>
    );
};

export default ReadChapter;