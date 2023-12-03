import {Button, Col, Input, Row} from "antd";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {stateActions} from "../store";
import {Constants} from "../model/constants";
import {PassageUtils} from "../helpers/passage-utils";
import {Passage} from "../model/passage";
import {PracticeConfig} from "../model/PracticeConfig";
import SpinnerTimer from "../components/SpinnerTimer";

const EnterExplanation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatcher = useDispatch();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currPsgTxt, setCurrPsgTxt] = useState<string>("");
    const [currPsgRef, setCurrPsgRef] = useState<string>("");
    const [currPsg, setCurrPsg] = useState<Passage>(undefined);
    const [explanation, setExplanation] = useState<string>("");
    const { TextArea } = Input;
    const user = useSelector((state: AppState) => state.user);
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);

    useEffect(() => {
        console.log("EnterExplanation.useEffect[location.state, practiceConfig] - entering, here's the location state: ", location.state);
        if (location.state) {
            console.log("EnterExplanation.useEffect[location.state, practiceConfig] - location state EXISTS!");
            setBusy({state: true, message: "Rendering passage passed in..."});
            const locPsg = location.state as Passage;
            const locPsgTxt = PassageUtils.getFormattedPassageText(locPsg, true);
            const locPsgRef = PassageUtils.getPassageStringNoIndex(
                locPsg,
                Constants.translationsShortNms.filter(t => t.code === locPsg.translationName).map(t => t.translationName)[0],
                true,
                locPsg.passageRefAppendLetter);
            setCurrPsgTxt(locPsgTxt);
            setCurrPsg(locPsg);
            setCurrPsgRef(locPsgRef);
            setExplanation(locPsg.explanation)
            setBusy({state: false, message: ""});
        }
    }, [location.state, practiceConfig]);

    const handleInput = (evt) => {
        setExplanation(evt.target.value);
    };

    const handleAddExplanation = async () => {
        dispatcher(stateActions.setPracticeConfig({practiceMode: practiceConfig.practiceMode, passageDisplayOrder: practiceConfig.passageDisplayOrder, startAtPassageId: currPsg.passageId} as PracticeConfig));
        const locPsg: Passage = {...currPsg};
        locPsg.explanation = explanation;
        navigate("/practice", {state: locPsg});
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message}/>;
    } else {
        return (
            <>
                {currPsgRef && currPsgTxt && <h1 style={{textAlign: "center"}}>{currPsgRef}</h1>}
                {currPsg && currPsgTxt &&
                <Row style={{marginBottom: "5px"}}>
                    <Col span={24}>
                        <p
                            style={{marginTop: "10px"}}
                            className="nugget-view"
                            dangerouslySetInnerHTML={{__html: currPsgTxt}}/>
                    </Col>
                </Row>
                }
                <Row style={{marginBottom: "5px"}}>
                    <Col span={24}>
                        <TextArea
                            disabled={user === Constants.GUEST_USER}
                            autoSize={{ minRows: 5, maxRows: 10 }}
                            style={{width: "100%", fontSize: "1.71rem", fontWeight: "bolder"}}
                            autoFocus
                            value={explanation}
                            onChange={handleInput}/>
                    </Col>
                </Row>
                <Row>
                    <Col><Button disabled={user === Constants.GUEST_USER || !explanation || explanation.trim().length === 0} type="primary" onClick={handleAddExplanation}>Add Explanation</Button></Col>
                </Row>
            </>
        );
    }
};

export default EnterExplanation;