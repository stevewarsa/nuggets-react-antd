import {Col, Input, Row, Select} from "antd";
import {Constants} from "../model/constants";
import {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import TextArea from "antd/es/input/TextArea";
import {StringUtils} from "../helpers/string.utils";

const EditPassage = ({passage}: {passage: Passage}) => {
    const {Option} = Select;
    const [startVerse, setStartVerse] = useState(passage.startVerse);
    const [endVerse, setEndVerse] = useState(passage.endVerse);
    const [translation, setTranslation] = useState(passage.translationName);
    let maxVerseByBookChapter = useSelector((appState: AppState) => appState.maxVerseByBookChapter[passage.translationName]);
    const [maxVerse, setMaxVerse] = useState(passage.endVerse);
    const [currPassageText, setCurrPassageText] = useState("");
    const [rowsInTextArea, setRowsInTextArea] = useState(10);
    const [colsInTextArea, setColsInTextArea] = useState(47);

    useEffect(() => {
        //console.log("useEffect - maxVerseByBookChapter:", maxVerseByBookChapter);
        if (!maxVerseByBookChapter || !passage) {
            //console.log("useEffect - maxVerseByBookChapter not populated yet, returning");
            return;
        }
        const maxChapVerseForBook = maxVerseByBookChapter[passage.bookName];
        //console.log("useEffect - maxChapVerseForBook:", maxChapVerseForBook);
        const maxVerseForChap = maxChapVerseForBook.find((chapAndVerse: number[]) => chapAndVerse[0] === passage.chapter);
        //console.log("useEffect - maxVerseForChap:", maxVerseForChap);
        setMaxVerse(maxVerseForChap[1]);
        if (passage.verses && passage.verses.length > 0) {
            const txt = PassageUtils.getUnformattedPassageTextNoVerseNumbers(passage);
            setCurrPassageText(txt);
            setRowsInTextArea(Math.ceil(txt.length / colsInTextArea));
        }
    }, [passage, maxVerseByBookChapter]);

    const changePassageText = (value) => {
        setCurrPassageText(value);
    };

    return <>
        <Row>
            <Col span={24}>
                <Select style={{width: "100%"}} size="large" value={translation} onChange={(value) => setTranslation(value)}>
                    <Option value="N/A">{"--Select Translation--"}</Option>
                    {Object.keys(Constants.translationLongNames).map(key => (
                            <Option key={key} value={key}>{Constants.translationLongNames[key]}</Option>
                        )
                    )}
                </Select>
            </Col>
        </Row>
        <Row align="middle">
            <Col span={3}>Start:</Col>
            <Col span={7} style={{marginRight: "6px"}}>
                <Select style={{width: "100%"}} size="large" value={startVerse} onChange={(value) => setStartVerse(value)}>
                    <Option value={-1}>{"--Start Verse--"}</Option>
                    {Array(maxVerse).fill(undefined).map((n, i) => i + 1).map(num => (
                        <Option key={"start-" + num} value={num}>{num}</Option>
                    ))}
                </Select>
            </Col>
            <Col span={3}>End:</Col>
            <Col span={7}>
                <Select style={{width: "100%"}} size="large" value={endVerse} onChange={(value) => setEndVerse(value)}>
                    <Option value={-1}>{"--End Verse--"}</Option>
                    {Array(maxVerse).fill(undefined).map((n, i) => i + 1).filter(num => num >= startVerse).map(num => (
                        <Option key={"end-" + num} value={num}>{num}</Option>
                    ))}
                </Select>
            </Col>
        </Row>
        {passage && !StringUtils.isEmpty(passage.passageRefAppendLetter) &&
            <Row>
                <Col span={6}>Append Letter:</Col>
                <Col span={2}><Input value={passage.passageRefAppendLetter}/></Col>
            </Row>
        }
        <Row>
            <Col span={24}>Passage Text:</Col>
        </Row>
        <Row>
            <Col span={24}>
                <TextArea rows={rowsInTextArea} value={currPassageText} onChange={changePassageText} />
            </Col>
        </Row>
    </>;
};

export default EditPassage;