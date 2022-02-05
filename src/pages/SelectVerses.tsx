import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Button, Checkbox, Col, notification, Row} from "antd";
import {useEffect, useState} from "react";
import {VerseNumAndText} from "../model/versenum-and-text";
import {useNavigate} from "react-router-dom";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";
import {stateActions} from "../store";

const SelectVerses = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const verseSelectionRequest = useSelector((appState: AppState) => appState.verseSelectionRequest);
    const [locVerses, setLocVerses] = useState([]);

    useEffect(() => {
        if (verseSelectionRequest) {
            const selectedVerses = PassageUtils.getFormattedVersesAsArray(verseSelectionRequest.passage, []);
            for (let i = 0; i < selectedVerses.length; i++) {
                selectedVerses[i].selected = i === 0 || i === (selectedVerses.length - 1);
            }
            setLocVerses(selectedVerses);
        }
    }, [verseSelectionRequest]);

    const handleSubmit = () => {
        // console.log("Handle submit - selected verses:");
        // console.log(locVerses.filter(v => v.selected));
        if (verseSelectionRequest.actionToPerform === "copy") {
            // copy selected verses to clipboard
            const selectedVerses = locVerses.filter(v => v.selected);
            if (selectedVerses.length === 1 || selectedVerses.length === 2) {
                const passage = {...verseSelectionRequest.passage};
                passage.startVerse = selectedVerses[0].verseNum;
                passage.endVerse = selectedVerses.length === 1 ? passage.startVerse : selectedVerses[1].verseNum;
                const psgRef = PassageUtils.getPassageStringNoIndex(passage, true, true);
                let clipboardString = psgRef + "\n\n";
                for (let verse of locVerses) {
                    if (verse.verseNum >= passage.startVerse && verse.verseNum <= passage.endVerse) {
                        clipboardString += verse.plainText;
                    }
                }
                copy(clipboardString);
                notification.info({message: psgRef + " copied!", placement: "bottomRight"});
            }
        }
        if (verseSelectionRequest.passage.passageId && verseSelectionRequest.passage.passageId > 0) {
            dispatcher(stateActions.setStartingPassageId(verseSelectionRequest.passage.passageId ));
        }
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
                    <Col span={2}>
                        <Checkbox onClick={() => handleSelectVerse(v)} checked={v.selected} />
                    </Col>
                    <Col span={2}>
                        {v.verseNum + ". "}
                    </Col>
                    <Col span={20}>
                        <p dangerouslySetInnerHTML={{__html: v.verseText}}/>
                    </Col>
                </Row>
            ))}
            <Row style={{marginTop: "20px"}}><Button type="primary" onClick={handleSubmit}>Submit</Button></Row>
        </>
    );
};

export default SelectVerses;