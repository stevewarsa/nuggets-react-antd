import {PlayCircleOutlined} from "@ant-design/icons";
import {Button, Col, Input, Row} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {stateActions} from "../store";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import {Passage} from "../model/passage";

const GoToPassageByRef = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const [passageRef, setPassageRef] = useState("");
    const [selectedTranslation, setSelectedTranslation] = useState("niv");
    const [parsedPassage, setParsedPassage] = useState<Passage>(undefined);
    const { TextArea } = Input;

    useEffect(() => {
        if (prefs) {
            setSelectedTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    const handleInput = (evt) => {
        const enteredPassageRef = evt.target.value;
        setPassageRef(enteredPassageRef);
        const passagesFromPassageRef: Passage[] = PassageUtils.getPassageFromPassageRef(enteredPassageRef.trim());
        console.log("Here are the passages parsed:", passagesFromPassageRef);
        if (passagesFromPassageRef.length > 0) {
            console.log("Setting the first one:", passagesFromPassageRef[0]);
            setParsedPassage(passagesFromPassageRef[0]);
        }
    };

    const handleGoToPassage = () => {
        dispatcher(stateActions.setChapterSelection({
            book: parsedPassage.bookName,
            chapter: parsedPassage.chapter,
            verse: parsedPassage.startVerse,
            translation: selectedTranslation
        }));
        navigate("/readChapter");
    };

    return (
        <>
            <h2><PlayCircleOutlined/> Go To Passage By Passage Ref</h2>
            <Row style={{marginBottom: "5px"}}>
                <Col span={24}>
                    <TextArea autoSize={{ minRows: 3, maxRows: 3 }} style={{width: "100%"}} autoFocus value={passageRef} onChange={handleInput}/>
                </Col>
            </Row>
            <Row>
                <Col><Button disabled={!passageRef || passageRef.trim().length === 0} type="primary" onClick={handleGoToPassage}>Go</Button></Col>
            </Row>
        </>
    );
};

export default GoToPassageByRef;