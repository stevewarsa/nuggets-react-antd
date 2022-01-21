import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Button, Checkbox, Col, Row} from "antd";
import {useEffect, useState} from "react";
import {VerseNumAndText} from "../model/versenum-and-text";
import {useNavigate} from "react-router-dom";
import {stateActions} from "../store";
import {VerseSelectionRequest} from "../model/verse-selection-request";

const SelectVerses = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const verseSelectionRequest = useSelector((appState: AppState) => appState.verseSelectionRequest);
    const [locVerses, setLocVerses] = useState(verseSelectionRequest ? [...verseSelectionRequest.versesForSelection] : []);
    useEffect(() => {
        const v = [...locVerses];
        for (let i = 0; i < v.length; i++) {
            v[i].selected = i === 0 || i === (v.length - 1);
        }
        setLocVerses(v);
    }, [verseSelectionRequest.versesForSelection]);

    const handleSubmit = () => {
        // console.log("Handle submit - selected verses:");
        // console.log(locVerses.filter(v => v.selected));
        dispatcher(stateActions.setVerseSelectionRequest({...verseSelectionRequest, versesForSelection: locVerses} as VerseSelectionRequest));
        navigate(verseSelectionRequest.backToPath);
    };

    const handleSelectVerse = (verse: VerseNumAndText) => {
        setLocVerses(Object.assign([], locVerses, {[locVerses.findIndex(v => v.verseNum === verse.verseNum)]: {...verse, selected: !verse.selected}}));
    };

    return (
        <>
            <Row><h2>Select either a single verse or a start/end verse</h2></Row>
            <Row style={{marginBottom: "20px"}}><Button key="submit2" type="primary" onClick={handleSubmit}>Submit</Button></Row>
            {locVerses && locVerses.map(v => (
                <Row key={v.verseNum}>
                    <Col key={v.verseNum + "cbkcol"} span={2}>
                        <Checkbox key={v.verseNum + "cbk"} onClick={() => handleSelectVerse(v)} checked={v.selected} />
                    </Col>
                    <Col key={v.verseNum + "vnum"} span={2}>
                        {v.verseNum + ". "}
                    </Col>
                    <Col key={v.verseNum + "vtxt"} span={20}>
                        <p dangerouslySetInnerHTML={{__html: v.verseText}}/>
                    </Col>
                </Row>
            ))}
            <Row style={{marginTop: "20px"}}><Button key="submit1" type="primary" onClick={handleSubmit}>Submit</Button></Row>
        </>
    );
};

export default SelectVerses;