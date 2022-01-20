import {PlusCircleOutlined} from "@ant-design/icons";
import {Button, Col, Input, Row} from "antd";
import {useEffect, useRef, useState} from "react";
import memoryService from "../services/memory-service";
import {Constants} from "../model/constants";
import SpinnerTimer from "../components/SpinnerTimer";
import {useHistory} from "react-router-dom";

const AddQuote = () => {
    const history = useHistory();
    const [rowCount, setRowCount] = useState(10);
    const [quote, setQuote] = useState("");
    const [busy, setBusy] = useState({state: false, message: ""});
    const { TextArea } = Input;
    const ref = useRef<HTMLTextAreaElement>();

    const handleInput = (evt) => {
        setQuote(evt.target.value);
    };

    useEffect(() => {
        if (!ref.current || !ref.current.cols) {
            return;
        }
        console.log("Effect - ref: ");
        console.log(ref.current);
        let lineFeeds = quote.split("\n").length * 2;
        setRowCount(Math.ceil((quote.length + lineFeeds) / ref.current.cols));
    }, [quote]);

    const handleAddQuote = async () => {
        setBusy({state: true, message: "Adding new quote..."});
        let qtParam: any = {
            prompt: quote.substring(0, quote.length > 10 ? 10 : quote.length) + '...',
            answer: quote,
            sourceId: null,
            fromUser: null
        };
        const response = await memoryService.addNonBibleQuote(qtParam, Constants.USER);
        if (response.data.objectionId > 1) {
            setBusy({state: false, message: ""});
            history.push("/browseQuotes");
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
                        <TextArea autoSize={{ minRows: 5, maxRows: 10 }} style={{width: "100%"}} autoFocus ref={ref} rows={rowCount} value={quote} onChange={handleInput}/>
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