import {PlayCircleOutlined} from "@ant-design/icons";
import {Button, Col, Input, Row} from "antd";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {stateActions} from "../store";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import {Passage} from "../model/passage";
import {BibleReferenceInput} from "../components/BibleReferenceInput";

const GoToPassageByRef = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const [passageRef, setPassageRef] = useState("");
    const [selectedTranslation, setSelectedTranslation] = useState("niv");
    const [parsedPassage, setParsedPassage] = useState<Passage>(undefined);

    const handleLogReference = () => {
    };

    useEffect(() => {
        if (prefs) {
            setSelectedTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    const handleGoToPassage = () => {
        console.log('Bible Reference:', passageRef);
        const passagesFromPassageRef: Passage[] = PassageUtils.getPassageFromPassageRef(passageRef.trim());
        console.log("Here are the passages parsed:", passagesFromPassageRef);
        if (passagesFromPassageRef.length > 0) {
            console.log("Setting the first one:", passagesFromPassageRef[0]);
            setParsedPassage(passagesFromPassageRef[0]);
            dispatcher(stateActions.setChapterSelection({
                book: passagesFromPassageRef[0].bookName,
                chapter: passagesFromPassageRef[0].chapter,
                verse: passagesFromPassageRef[0].startVerse,
                translation: selectedTranslation
            }));
            navigate("/readChapter");
        }
    };

    return (
        <>
            <h2><PlayCircleOutlined/> Go To Passage By Passage Ref</h2>
            <Row style={{marginBottom: "5px"}}>
                <Col span={24}>
                    <BibleReferenceInput value={passageRef} onChange={setPassageRef} />
                </Col>
            </Row>
            <Row>
                <Col><Button disabled={!passageRef || passageRef.trim().length === 0} type="primary" onClick={handleGoToPassage}>Go</Button></Col>
            </Row>
        </>
    );
};

export default GoToPassageByRef;