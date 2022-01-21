import {PlusCircleOutlined} from "@ant-design/icons";
import {Button, Col, Input, Row} from "antd";
import {useState} from "react";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {stateActions} from "../store";

const AddQuote = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const [quote, setQuote] = useState("");
    const [busy, setBusy] = useState({state: false, message: ""});
    const { TextArea } = Input;
    const user = useSelector((state: AppState) => state.user);

    const handleInput = (evt) => {
        setQuote(evt.target.value);
    };

    const handleAddQuote = async () => {
        setBusy({state: true, message: "Adding new quote..."});
        let qtParam: any = {
            prompt: quote.substring(0, quote.length > 10 ? 10 : quote.length) + '...',
            answer: quote,
            sourceId: null,
            fromUser: null
        };
        const response = await memoryService.addNonBibleQuote(qtParam, user);
        if (response.data.objectionId > 1) {
            setBusy({state: false, message: ""});
            dispatcher(stateActions.setStartingQuote(response.data.objectionId));
            navigate("/browseQuotes");
        } else {
            setBusy({state: false, message: ""});
        }
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message}/>;
    } else {
        return (
            <>
                <h2><PlusCircleOutlined/> Add Quote</h2>
                <Row style={{marginBottom: "5px"}}>
                    <Col span={24}>
                        <TextArea autoSize={{ minRows: 5, maxRows: 10 }} style={{width: "100%"}} autoFocus value={quote} onChange={handleInput}/>
                    </Col>
                </Row>
                <Row>
                    <Col><Button disabled={!quote || quote.trim().length === 0} type="primary" onClick={handleAddQuote}>Add Quote</Button></Col>
                </Row>
            </>
        );
    }
};

export default AddQuote;