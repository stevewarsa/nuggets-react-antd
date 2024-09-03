import {notification, Button, Card, Col, Row, Select, Modal} from "antd";
import {Constants} from "../model/constants";
import React, {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import TextArea from "antd/es/input/TextArea";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
import {stateActions} from "../store";
import {UpdatePassageParam} from "../model/update-passage-param";
import SpinnerTimer from "./SpinnerTimer";

interface EditPassageProps {
    passage: Passage;
    visible: boolean;
    setVisibleFunction: Function;
}
const colsInTextArea = 47;
const EditPassage = ({props}: {props: EditPassageProps}) => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const {Option} = Select;
    const [psgTextChanged, setPsgTextChanged] = useState(false);
    const [startVerse, setStartVerse] = useState(props.passage.startVerse);
    const [frequency, setFrequency] = useState(props.passage.frequencyDays);
    const [endVerse, setEndVerse] = useState(props.passage.endVerse);
    const [appendLetter, setAppendLetter] = useState(props.passage.passageRefAppendLetter ? props.passage.passageRefAppendLetter : undefined);
    const [translation, setTranslation] = useState(props.passage.translationName);
    let maxVerseByBookChapterMap = useSelector((appState: AppState) => appState.maxVerseByBookChapter);
    const [maxVerse, setMaxVerse] = useState(props.passage.endVerse);
    const [currPassageText, setCurrPassageText] = useState("");
    const [rowsInTextArea, setRowsInTextArea] = useState(10);
    const [frequencies, setFrequencies] = useState<{freqLabel: string, freqValue: number}[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [editPassageVisible, setEditPassageVisible] = useState(props.visible);

    useEffect(() => {
        // populate the frequency dropdown values (only one time - no dependencies)
        const freqDep: {freqLabel: string, freqValue: number}[] = [];
        freqDep.push({freqValue: -1, freqLabel: "Every Time"});
        for (let i = 1; i <= 3; i++) {
            freqDep.push({freqLabel: i + "", freqValue: i});
        }
        setFrequencies(freqDep);
        setEditPassageVisible(true);
    }, []);

    useEffect(() => {
        setEditPassageVisible(props.visible);
    }, [props.visible]);

    useEffect(() => {
    }, [editPassageVisible]);

    useEffect(() => {
        if (!maxVerseByBookChapterMap?.hasOwnProperty(translation)) {
            (async () => {
                const locMaxVerseByBookChapter = await memoryService.getMaxVerseByBookChapter(translation);
                dispatcher(stateActions.setMaxVerseByBookChapter({maxVerseByBookChapter: locMaxVerseByBookChapter.data, translation: translation}));
            })();
            return;
        }
        if (!props.passage || props.passage.passageId === -1 || !props.passage.verses || props.passage.verses.length === 0) {
            return;
        }
        const locMaxVerseByBookChapter = maxVerseByBookChapterMap[translation];
        const maxChapVerseForBook = locMaxVerseByBookChapter[props.passage.bookName];
        const maxVerseForChap = maxChapVerseForBook.find((chapAndVerse: number[]) => chapAndVerse[0] === props.passage.chapter);
        setMaxVerse(maxVerseForChap[1]);
        setStartVerse(props.passage.startVerse);
        setEndVerse(props.passage.endVerse);
        setFrequency(props.passage.frequencyDays);
        setAppendLetter(props.passage.passageRefAppendLetter);
        populateCurrentPassageTextFromPassage(props.passage);
    }, [props.passage, maxVerseByBookChapterMap]);

    const populateCurrentPassageTextFromPassage = (psg: Passage) => {
        if (psg.verses && psg.verses.length > 0) {
            const txt = PassageUtils.getUnformattedPassageTextNoVerseNumbers(psg);
            setCurrPassageText(txt);
            setRowsInTextArea(Math.ceil(txt.length / colsInTextArea));
        }
    }

    const changePassageText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPsgTextChanged(currPassageText !== e.target.value);
        setCurrPassageText(e.target.value);
        if (!StringUtils.isEmpty(e.target.value) && StringUtils.isEmpty(appendLetter)) {
            setAppendLetter("a");
        }

        if (StringUtils.isEmpty(e.target.value)) {
            setAppendLetter(undefined);
        }
    };

    const changeTranslation = (value: string) => {
        if (value !== translation) {
            setTranslation(value);
            const locPassage = {...props.passage}
            locPassage.translationId = value;
            locPassage.translationName = value;
            (async () => {
                const resp = await memoryService.getPassage(locPassage, user);
                locPassage.verses = resp.data.verses;
                populateCurrentPassageTextFromPassage(locPassage);
                // When only the translation changed, we need to make sure this text from a different translation
                // is not submitted as "override" text, since the user hasn't modified the text manually
                setPsgTextChanged(false);
            })();
        }
    };

    const changeStartVerse = (value) => {
        if (parseInt(value) !== startVerse) {
            setStartVerse(parseInt(value));
        }
    };

    const changeEndVerse = (value) => {
        if (parseInt(value) !== endVerse) {
            setEndVerse(parseInt(value));
        }
    };

    const changPassageAppendLetter = (value) => {
        if (value !== appendLetter) {
            setAppendLetter(value);
        }
    };

    const changeFrequency = (value) => {
        if (parseInt(value) !== frequency) {
            setFrequency(parseInt(value));
        }
    }

    const submitChanges = () => {
        const updateParam: UpdatePassageParam = new UpdatePassageParam();
        updateParam.passageRefAppendLetter = appendLetter;
        updateParam.user = user;
        updateParam.newText = psgTextChanged ? currPassageText : null;
        updateParam.passage = {...props.passage,
            translationName: translation,
            translationId: translation,
            startVerse: startVerse,
            endVerse: endVerse,
            frequencyDays: frequency
        };
        setBusy({state: true, message: "Updating passage..."});
        memoryService.updatePassage(updateParam).then(resp => {
            if (resp.data === "success") {
                notification.success({message: "Passage has been updated!", placement: "bottomRight"});
                setEditPassageVisible(false);
                props.setVisibleFunction(false);
            } else {
                notification.error({message: "Error updating passage: " + resp.data, placement: "top"});
            }
            setBusy({state: false, message: ""});
        });
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <Modal title="Edit Passage" footer={null} open={editPassageVisible} onCancel={() => {
                setEditPassageVisible(false);
                props.setVisibleFunction(true);
            }}>
                <Card bordered={true}>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>
                            <Select style={{width: "100%"}} size="large" value={translation} onChange={changeTranslation}>
                                <Option value="N/A">{"--Select Translation--"}</Option>
                                {Object.keys(Constants.translationLongNames).map(key => (
                                        <Option key={key} value={key}>{Constants.translationLongNames[key]}</Option>
                                    )
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row align="middle" style={{marginBottom: "4px"}}>
                        <Col span={3}>Start:</Col>
                        <Col span={7} style={{marginRight: "6px"}}>
                            <Select style={{width: "100%"}} size="large" value={startVerse} onChange={changeStartVerse}>
                                <Option value={-1}>{"--Start Verse--"}</Option>
                                {Array(maxVerse).fill(undefined).map((n, i) => i + 1).map(num => (
                                    <Option key={"start-" + num} value={num}>{num}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={3}>End:</Col>
                        <Col span={7}>
                            <Select style={{width: "100%"}} size="large" value={endVerse} onChange={changeEndVerse}>
                                <Option value={-1}>{"--End Verse--"}</Option>
                                {Array(maxVerse).fill(undefined).map((n, i) => i + 1).filter(num => num >= startVerse).map(num => (
                                    <Option key={"end-" + num} value={num}>{num}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={6}>Append Letter:</Col>
                        <Col span={18}>
                            <Select style={{width: "100%"}} size="small" value={appendLetter}
                                    onChange={changPassageAppendLetter}>
                                <Option value={undefined}>{"--No Append Letter--"}</Option>
                                {["a", "b", "c"].map(letter => (
                                    <Option key={letter} value={letter}>{letter}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row align="middle" style={{marginBottom: "4px"}}>
                        <Col span={12}>Box:</Col>
                        <Col span={12}>
                            <Select style={{width: "100%"}} size="large" value={frequency} onChange={changeFrequency}>
                                {frequencies.map(freq => (
                                        <Option key={freq.freqValue} value={freq.freqValue}>{freq.freqLabel}</Option>
                                    )
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>Passage Text:</Col>
                    </Row>
                    <Row style={{marginBottom: "8px"}}>
                        <Col span={24}>
                            <TextArea rows={rowsInTextArea} value={currPassageText} onChange={changePassageText}/>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>
                            <Button onClick={submitChanges}>Submit Update</Button>
                        </Col>
                    </Row>
                </Card>
            </Modal>
        );
    }
};

export default EditPassage;