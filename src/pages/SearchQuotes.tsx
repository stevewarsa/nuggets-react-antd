import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Input, Row} from "antd";
import {QuoteMatch} from "../model/quote-match";
import {doFuzzySearch} from "./BrowseQuotes";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";

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
            // Declare a new array
            let newArray = [];

            // Declare an empty object
            let uniqueObject = {};

            // Loop for the array elements
            for (let i in quotes) {

                // Extract the title
                let objectionId = quotes[i]['objectionId'];

                // Use the title as the index
                uniqueObject[objectionId] = quotes[i];
            }

            // Loop to push unique object into array
            for (let i in uniqueObject) {
                newArray.push(uniqueObject[i]);
            }
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
                {filteredQuotes && filteredQuotes.length > 0 && <Row>
                    <Col>
                        {filteredQuotes.length} Quotes
                    </Col>
                </Row>}
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
                            <Col span={24} key={q.originalQuote.objectionId + "buttoncol"}>
                                <Button key={q.originalQuote.objectionId + "button"}
                                        type="link"
                                        onClick={() => goTo(q.originalQuote.objectionId)}>Go
                                    To</Button>
                            </Col>
                        </Row>
                    </div>
                )}
            </>
        );
    }
};

export default SearchQuotes;