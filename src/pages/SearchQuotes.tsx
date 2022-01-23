import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Input, notification, Row} from "antd";
import {QuoteMatch} from "../model/quote-match";
import {doFuzzySearch} from "./BrowseQuotes";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";

const SearchQuotes = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [searchString, setSearchString] = useState("");
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<QuoteMatch[]>(null);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving quotes from server..."});
            const quoteListResponse = await memoryService.getQuoteList(user);
            const quotes: Quote[] = quoteListResponse.data.filter(({objectionId, answer}, index, a) =>
                a.findIndex(e => objectionId === e.objectionId && answer === e.answer) === index)
                .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
            const newArray = PassageUtils.removeDups(quotes, "objectionId");
            setAllQuotes(newArray);
            setFilteredQuotes(newArray.map(q => {
                return {originalQuote: q, annotatedText: q.answer} as QuoteMatch;
            }));
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    const handleSearch =  async (evt) => {
        setBusy({state: true, message: "Searching quotes..."});
        const locSearchStr = evt.target.value;
        if (!locSearchStr || locSearchStr === "") {
            setFilteredQuotes(allQuotes.map(q => {
                return {originalQuote: q, annotatedText: q.answer} as QuoteMatch;
            }));
            setSearchString("");
        } else {
            const results = doFuzzySearch(locSearchStr, allQuotes);
            setFilteredQuotes(results);
            setSearchString(locSearchStr);
        }
        setBusy({state: false, message: ""});
    };

    const goTo = (objectionId: number) => {
        dispatcher(stateActions.setStartingQuote(objectionId));
        navigate("/browseQuotes");
    };

    const handleFilterToCurrent = () => {
        dispatcher(stateActions.setFilteredQuoteIds(filteredQuotes.map(qt => qt.originalQuote.objectionId)));
        navigate("/browseQuotes");
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message}/>;
    } else {
        return (
            <>
                <h1>Search Quotes</h1>
                <Row>
                    <Col>
                        <Input autoFocus value={searchString} placeholder="Enter Search" onChange={handleSearch} />
                    </Col>
                </Row>
                {filteredQuotes && filteredQuotes.length > 0 &&
                <>
                    <Row>
                        <Col>
                            {filteredQuotes.length} Quotes
                        </Col>
                    </Row>
                    {filteredQuotes.length < allQuotes.length && <Row>
                        <Col>
                            <Button type="primary" onClick={handleFilterToCurrent}>Browse Current Result</Button>
                        </Col>
                    </Row>}
                </>
                }
                {filteredQuotes && filteredQuotes.length > 0 && filteredQuotes.map(q =>
                    <div key={q.originalQuote.objectionId + "div"} style={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        marginBottom: "5px"
                    }}>
                        <Row key={q.originalQuote.objectionId + "quoterow"}
                             style={{marginBottom: "5px"}}>
                            <Col span={24} key={q.originalQuote.objectionId + "quote"}
                                 dangerouslySetInnerHTML={{__html: q.annotatedText}}/>
                        </Row>
                        <Row key={q.originalQuote.objectionId + "buttonrow"}>
                            <Col span={12} key={q.originalQuote.objectionId + "buttoncol1"}>
                                <Button key={q.originalQuote.objectionId + "button1"}
                                        type="link"
                                        onClick={() => goTo(q.originalQuote.objectionId)}>Go To</Button>
                            </Col>
                            <Col span={12} key={q.originalQuote.objectionId + "buttoncol2"}>
                                <Button key={q.originalQuote.objectionId + "button2"}
                                        type="link"
                                        onClick={() => {
                                            copy(q.originalQuote.answer);
                                            notification.info({message: "Quote copied!", placement: "bottomRight"});
                                        }}>Copy</Button>
                            </Col>
                        </Row>
                    </div>
                )}
            </>
        );
    }
};

export default SearchQuotes;