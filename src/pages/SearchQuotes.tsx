import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useRef, useState} from "react";
import {Quote} from "../model/quote";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Input, Row} from "antd";
import {QuoteMatch} from "../model/quote-match";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {CellClickedEvent} from "ag-grid-community";
import {DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import QuoteCellRenderer from "../renderers/QuoteCellRenderer";
import useLoadQuotes from "../hooks/use-load-quotes";

const SearchQuotes = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const {doQuotesLoad} = useLoadQuotes();
    const user = useSelector((state: AppState) => state.user);
    const filteredQuotes = useSelector((appState: AppState) => appState.filteredQuotes);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [searchString, setSearchString] = useState("");
    const [filteredQuoteMatches, setFilteredQuoteMatches] = useState<QuoteMatch[]>(null);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const gridApiRef = useRef<any>(null); // <= defined useRef for gridApi

    useEffect(() => {
        setBusy({state: true, message: "Retrieving quotes from server..."});
        doQuotesLoad();
        setBusy({state: false, message: ""});
    }, [user]);

    const handleFilterToCurrent = () => {
        dispatcher(stateActions.setCurrentSearchString(searchString));
        dispatcher(stateActions.setFilteredQuotes(filteredQuoteMatches.map(qt => qt.originalQuote)));
        navigate("/browseQuotes");
    };

    const onGridReady = (params) => {
        params.api.resetRowHeights();
        gridApiRef.current = params.api // assigned gridApi value on Grid ready
        gridApiRef.current.setDomLayout('autoHeight');
    };

    const handleTableFilter = (evt) => {
        setSearchString(evt.target.value);
        if (gridApiRef.current) {
            gridApiRef.current.setQuickFilter(evt.target.value);
        }
    };

    const handleFilterChanged = ev => {
        if (ev?.api?.rowModel?.rowsToDisplay) {
            const quotes = ev.api.rowModel.rowsToDisplay.map(row => {
                return {originalQuote: row.data, annotatedText: row.data.quoteTx} as QuoteMatch;
            });
            setFilteredQuoteMatches(quotes);
        } else {
            console.log("handleFilterChanged - no rows ");
        }
    };

    const goTo = (quoteId: number) => {
        dispatcher(stateActions.setStartingQuote(quoteId));
        navigate("/browseQuotes");
    };

    const onPaginationChanged = (evt) => {
        if (evt && evt.api) {
            const pgInfo = {
                currentPage: evt.api.paginationGetCurrentPage() + 1,
                totalPages: evt.api.paginationGetTotalPages(),
                totalRows: evt.api.paginationGetRowCount(),
                isLastPage: evt.api.paginationIsLastPageFound(),
                pageSize: evt.api.paginationGetPageSize()
            };
            setPaginationInfo(pgInfo);
        }
    };

    const onBtFirst = () => {
        if (gridApiRef.current) {
            gridApiRef.current.paginationGoToFirstPage();
        }
    };

    const onBtLast = () => {
        if (gridApiRef.current) {
            gridApiRef.current.paginationGoToLastPage();
        }
    };

    const onBtNext = () => {
        if (gridApiRef.current) {
            gridApiRef.current.paginationGoToNextPage();
        }
    };

    const onBtPrevious = () => {
        if (gridApiRef.current) {
            gridApiRef.current.paginationGoToPreviousPage();
        }
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message}/>;
    } else {
        return (
            <>
                <Row justify="center">
                    <h1>Search Quotes</h1>
                </Row>
                <Row justify="center" align="middle">
                    <Col style={{marginRight: "5px"}}>
                        <Input autoFocus value={searchString} placeholder="Enter Search" onChange={handleTableFilter}/>
                    </Col>
                </Row>
                {paginationInfo && <Row justify="center">
                    <Col>Pg {paginationInfo.currentPage} of {paginationInfo.totalPages} ({paginationInfo.totalRows} matches)</Col>
                </Row>}
                <Row justify="center">
                    <Col style={{marginRight: "5px"}}><Button disabled={paginationInfo?.currentPage === 1} icon={<DoubleLeftOutlined />} onClick={onBtFirst}/></Col>
                    <Col style={{marginRight: "5px"}}><Button disabled={paginationInfo?.currentPage === 1} icon={<LeftOutlined />} onClick={onBtPrevious}/></Col>
                    <Col style={{marginRight: "5px"}}><Button disabled={paginationInfo?.currentPage === paginationInfo?.totalPages} icon={<RightOutlined />} onClick={onBtNext}/></Col>
                    <Col style={{marginRight: "5px"}}><Button disabled={paginationInfo?.currentPage === paginationInfo?.totalPages} icon={<DoubleRightOutlined />} onClick={onBtLast}/></Col>
                </Row>
                <Row justify="center">
                    <Col>
                        <Button disabled={paginationInfo?.totalRows === filteredQuotes?.length} type="primary" onClick={handleFilterToCurrent}>Browse Current Result</Button>
                    </Col>
                </Row>
                <div style={{ width: "100%", height: "100%" }}>
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
                            rowData={filteredQuotes}
                            frameworkComponents={{
                                quoteCellRenderer: QuoteCellRenderer
                            }}
                            gridOptions={{
                                pagination: true,
                                paginationPageSize: 6,
                                getRowStyle: () => {
                                    return {borderWidth: "thick"};
                                },
                                onCellClicked: (event: CellClickedEvent) => goTo((event.data as Quote).quoteId)
                            }}
                            onGridReady={onGridReady}
                            onPaginationChanged={onPaginationChanged}
                            defaultColDef={{
                                editable: true,
                                sortable: true,
                                flex: 1,
                                minWidth: 300,
                                filter: true,
                                resizable: true
                            }}
                            onFilterChanged={handleFilterChanged}
                            suppressPaginationPanel={true}
                            ref={gridApiRef}>
                            <AgGridColumn
                                wrapText={true}
                                autoHeight={true}
                                cellRenderer="quoteCellRenderer"
                                cellRendererParams={{"searchString": searchString}}
                                field="quoteTx"
                                headerName="Quote Text"/>
                        </AgGridReact>
                    </div>
                </div>
            </>
        );
    }
};

export default SearchQuotes;