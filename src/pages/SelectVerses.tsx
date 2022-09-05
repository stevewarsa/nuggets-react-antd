import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Button, Checkbox, Col, notification, Row} from "antd";
import {useEffect, useState} from "react";
import {VerseNumAndText} from "../model/versenum-and-text";
import {useNavigate} from "react-router-dom";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";
import {stateActions} from "../store";
import useMemoryPassages from "../hooks/use-memory-passages";
import SpinnerTimer from "../components/SpinnerTimer";

const SelectVerses = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const {addMemoryPassage} = useMemoryPassages();
    const verseSelectionRequest = useSelector((appState: AppState) => appState.verseSelectionRequest);
    const user = useSelector((state: AppState) => state.user);
    const [locVerses, setLocVerses] = useState([]);
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        if (verseSelectionRequest) {
            const selectedVerses = PassageUtils.getFormattedVersesAsArray(verseSelectionRequest.passage, []);
            for (let i = 0; i < selectedVerses.length; i++) {
                selectedVerses[i].selected = i === 0 || i === (selectedVerses.length - 1);
            }
            setLocVerses(selectedVerses);
        }
    }, [verseSelectionRequest]);

    const handleSubmit = async () => {
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
        } else if (verseSelectionRequest.actionToPerform === "add-to-memory") {
            const selectedVerses = locVerses.filter(v => v.selected);
            if (selectedVerses.length === 1 || selectedVerses.length === 2) {
                const passage = {...verseSelectionRequest.passage};
                passage.startVerse = selectedVerses[0].verseNum;
                passage.endVerse = selectedVerses.length === 1 ? passage.startVerse : selectedVerses[1].verseNum;
                const psgRef = PassageUtils.getPassageStringNoIndex(passage, true, true);
                setBusy({state: true, message: "Adding " + psgRef + " to memory list..."});
                const passageId: number = await addMemoryPassage(passage, user);
                setBusy({state: false, message: ""});
                if (passageId === -1) {
                    notification.info({message: psgRef + " NOT added to memory list.  There may've been an error while adding it - check application logs", placement: "bottomRight"});
                } else {
                    notification.info({message: psgRef + " added to memory list!", placement: "bottomRight"});
                }
            }
        }
        if (verseSelectionRequest.passage.passageId && verseSelectionRequest.passage.passageId > 0) {
            dispatcher(stateActions.setStartingPassageId(verseSelectionRequest.passage.passageId));
        }
        navigate(verseSelectionRequest.backToPath);
    };

    const handleSelectVerse = (verse: VerseNumAndText) => {
        setLocVerses(Object.assign([], locVerses, {[locVerses.findIndex(v => v.verseNum === verse.verseNum)]: {...verse, selected: !verse.selected}}));
    };

    return (
        <>
            <Row><h2>Select either a single verse or a start/end verse</h2></Row>
            {busy.state && <SpinnerTimer message={busy.message} />}
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