import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useRef, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Input, Row} from "antd";
import {QuoteMatch} from "../model/quote-match";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {PassageUtils} from "../helpers/passage-utils";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {CellClickedEvent} from "ag-grid-community";

const SearchQuotes = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const existingQuoteList = useSelector((state: AppState) => state.existingQuoteList);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [searchString, setSearchString] = useState("");
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<QuoteMatch[]>(null);
    const gridApiRef = useRef<any>(null); // <= defined useRef for gridApi

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
        const processExistingQuotes = async () => {
            setAllQuotes(existingQuoteList);
            await setFilteredQuotes(existingQuoteList.map(q => {
                return {originalQuote: q, annotatedText: q.answer} as QuoteMatch;
            }));
        };
        if (!existingQuoteList || existingQuoteList.length === 0) {
            callServer();
        } else {
            processExistingQuotes();
        }
    }, [user, existingQuoteList]);

    const handleFilterToCurrent = () => {
        dispatcher(stateActions.setFilteredQuoteIds(filteredQuotes.map(qt => qt.originalQuote.objectionId)));
        navigate("/browseQuotes");
    };

    const onGridReady = (params) => {
        params.api.resetRowHeights();
        gridApiRef.current = params.api // assigned gridApi value on Grid ready
    };

    const handleTableFilter = (evt) => {
        setSearchString(evt.target.value);
        gridApiRef.current.setQuickFilter(evt.target.value); //  Used the GridApi here Yay!!!!!
    };

    const defaultColDef = {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 300,
        filter: true,
        resizable: true
    };
    const gridOptions = {
        pagination: true,
        paginationPageSize: 6,
        onCellClicked: (event: CellClickedEvent) => goTo((event.data as Quote).objectionId)
    };

    const handleFilterChanged = ev => {
        if (ev?.api?.rowModel?.rowsToDisplay) {
            const quotes = ev.api.rowModel.rowsToDisplay.map(row => {
                return {originalQuote: row.data, annotatedText: row.data.answer} as QuoteMatch;
            });
            setFilteredQuotes(quotes);
        } else {
            console.log("handleFilterChanged - no rows ");
        }
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
                        <Input autoFocus value={searchString} placeholder="Enter Search" onChange={handleTableFilter}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button type="primary" onClick={handleFilterToCurrent}>Browse Current Result</Button>
                    </Col>
                </Row>
                <div style={{ width: "100%", height: "350px" }}>
                    <div
                        id="myGrid"
                        style={{
                            height: "100%",
                            width: "100%"
                        }}
                        className="ag-theme-alpine"
                    >
                        <AgGridReact
                            reactUi={true}
                            rowData={allQuotes}
                            gridOptions={gridOptions}
                            onGridReady={onGridReady}
                            defaultColDef={defaultColDef}
                            onFilterChanged={handleFilterChanged}
                            ref={gridApiRef}>
                            <AgGridColumn
                                wrapText={true}
                                autoHeight={true}
                                field="answer"
                                headerName="Quote Text"/>
                        </AgGridReact>
                    </div>
                </div>
            </>
        );
    }
};

export default SearchQuotes;