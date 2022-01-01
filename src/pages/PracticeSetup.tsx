import {Button, Radio, Row, Space} from "antd";
import {useState} from "react";
import {CaretRightOutlined} from "@ant-design/icons";
import {stateActions} from "../store";
import {PracticeConfig} from "../model/PracticeConfig";
import {useHistory} from "react-router-dom";
import {useDispatch} from "react-redux";

const PracticeSetup = () => {
    const history = useHistory();
    const dispatcher = useDispatch();
    const [practiceMode, setPracticeMode] = useState(1);
    const [passageDisplayOrder, setPassageDisplayOrder] = useState(1);

    const handlePracticeModeChange = (e: any) => {
        setPracticeMode(parseInt(e.target.value));
    };
    const handlePassageDisplayOrderChange = (e: any) => {
        setPassageDisplayOrder(parseInt(e.target.value));
    };

    const handleStart = () => {
        console.log("Handle Start");
        dispatcher(stateActions.setPracticeConfig({practiceMode: practiceMode, passageDisplayOrder: passageDisplayOrder} as PracticeConfig));
        history.push("/practice");
    }

    return (
        <>
            <Row style={{marginBottom: '5px'}}>
                <h3>Practice Mode:</h3>
            </Row>
            <Row style={{marginBottom: '20px'}}>
                <Radio.Group onChange={handlePracticeModeChange} value={practiceMode}>
                    <Space direction="vertical">
                        <Radio checked={practiceMode === 1} value={1}>By Reference</Radio>
                        <Radio checked={practiceMode === 2} value={2}>By Passage Text</Radio>
                    </Space>
                </Radio.Group>
            </Row>
            <Row style={{marginBottom: '5px'}}>
                <h3>Passage Display Order:</h3>
            </Row>
            <Row style={{marginBottom: '20px'}}>
                <Radio.Group onChange={handlePassageDisplayOrderChange} value={passageDisplayOrder}>
                    <Space direction="vertical">
                        <Radio value={1}>By Frequency</Radio>
                        <Radio value={2}>By Random</Radio>
                        <Radio value={3}>By Last Practiced Date/Time</Radio>
                    </Space>
                </Radio.Group>
            </Row>
            <Row style={{marginBottom: '10px'}}>
                <Button icon={<CaretRightOutlined />} type="primary" onClick={handleStart}>Start</Button>
            </Row>
        </>
    );
};

export default PracticeSetup;