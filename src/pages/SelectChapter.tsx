import {Button, Col, Row, Select} from "antd";
import {useState} from "react";
import {Constants} from "../model/constants";
import {ReadFilled} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {stateActions} from "../store";
import {useHistory} from "react-router-dom";
import {AppState} from "../model/AppState";

const SelectChapter = () => {
    const dispatcher = useDispatch();
    const maxChaptersByBook = useSelector((state: AppState) => state.maxChaptersByBook);
    const chapterConfig = useSelector((state: AppState) => state.chapterSelection);
    const history = useHistory();
    const {Option} = Select;
    const [book, setBook] = useState(chapterConfig ? chapterConfig.book : "N/A");
    const [chapter, setChapter] = useState(chapterConfig ? chapterConfig.chapter : "N/A");
    const [translation, setTranslation] = useState(chapterConfig ? chapterConfig.translation : "N/A");
    const [bookChapters, setBookChapters] = useState([]);

    const handleBookChange = (value) => {
        console.log(`selected book ${value}`);
        setBook(value);
        const maxChapter = maxChaptersByBook.filter(m => m.bookName === value)[0].maxChapter;
        if (maxChapter > 0) {
            let chapters = Array.from({length: maxChapter}, (e, i) => i + 1);
            setBookChapters(chapters);
        }
    };

    const handleChapterChange = (value) => {
        console.log(`selected chapter ${value}`);
        setChapter(value);
    };

    const handleTranslationChange = (value) => {
        console.log(`selected translation ${value}`);
        setTranslation(value);
    };

    const handleReadChapter = () => {
        console.log("handleReadChapter - here are the selections:");
        console.log("book: " + book + ", chapter: " + chapter + ", translation: " + translation);
        dispatcher(stateActions.setChapterSelection({book: book, chapter: chapter, translation: translation}));
        history.push("/readChapter");
    };

    return (
        <>
            <h1>Read Chapter</h1>
            <Row style={{marginBottom: "5px"}}>
                <Col span={24}>
                    <Select style={{width: "100%"}} size="large" defaultValue={book} value={book} onChange={handleBookChange}>
                        <Option value="N/A">{"--Select Book--"}</Option>
                        {Object.keys(Constants.bookAbbrev).map(key => (
                                <Option key={key} value={key}>{Constants.bookAbbrev[key][1]}</Option>
                            )
                        )}
                    </Select>
                </Col>
            </Row>
            <Row style={{marginBottom: "5px"}}>
                <Col span={24}>
                    <Select style={{width: "100%"}} size="large" value={chapter} onChange={handleChapterChange}>
                        <Option value="N/A">{"--Select Chapter--"}</Option>
                        {bookChapters.map(c => (
                                <Option key={c} value={c}>{c}</Option>
                            )
                        )}
                    </Select>
                </Col>
            </Row>
            <Row style={{marginBottom: "20px"}}>
                <Col span={24}>
                    <Select style={{width: "100%"}} size="large" value={translation} onChange={handleTranslationChange}>
                        <Option value="N/A">{"--Select Translation--"}</Option>
                        {Object.keys(Constants.translationLongNames).map(key => (
                                <Option key={key} value={key}>{Constants.translationLongNames[key]}</Option>
                            )
                        )}
                    </Select>
                </Col>
            </Row>
            <Row style={{marginBottom: "5px"}}>
                <Col span={24}>
                    <Button type="primary" icon={<ReadFilled/>} onClick={handleReadChapter}>Read Selected Chapter</Button>
                </Col>
            </Row>
        </>
    );
};

export default SelectChapter;