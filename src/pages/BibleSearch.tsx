import {Button, Col, Divider, Input, Modal, Radio, Row, Select} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {Constants} from "../model/constants";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import {MailOutlined, SearchOutlined} from "@ant-design/icons";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Passage} from "../model/passage";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';

const BibleSearch = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {Option} = Select;
    const {TextArea} = Input;
    const [searchScope, setSearchScope] = useState("both");
    const [book, setBook] = useState("All");
    const [translation, setTranslation] = useState("all");
    const [searchPhrase, setSearchPhrase] = useState("");
    const [searching, setSearching] = useState({state: false, message: ""});
    const [searchResults, setSearchResults] = useState<{visible: boolean, results: Passage[]}>({visible: false, results: []});
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const user = useSelector((state: AppState) => state.user);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [emailInputModalOpen, setEmailInputModalOpen] = useState<boolean>(false);
    const [emailToSendTo, setEmailToSendTo] = useState<string>(undefined);
	const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
	const draggleRef = useRef<HTMLDivElement>(null);
	
    useEffect(() => {
        if (prefs && prefs.length > 0) {
            setTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    const handleBookChange = (value) => {
        setBook(value);
    };

    const handleTranslationChange = (value) => {
        setTranslation(value);
    };
	const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
		const { clientWidth, clientHeight } = window.document.documentElement;
		const targetRect = draggleRef.current?.getBoundingClientRect();
		if (!targetRect) {
		  return;
		}
		setBounds({
		  left: -targetRect.left + uiData.x,
		  right: clientWidth - (targetRect.right - uiData.x),
		  top: -targetRect.top + uiData.y,
		  bottom: clientHeight - (targetRect.bottom - uiData.y),
		});
	};

    const handleSearch = async () => {
        setSearching({state: true, message: "Searching for '" + searchPhrase + "'..."});
        setSearchResults({visible: false, results: []});
        const translations: string[] = translation === "all" ? Object.keys(Constants.translationLongNames) : [translation];
        const param: any = {
            book: book,
            translations: translations,
            testament: searchScope,
            searchPhrase: searchPhrase,
            user: user
        };
        const searchBibleResult = await memoryService.searchBible(param);
        setSearchResults({visible: true, results: searchBibleResult.data});
        setSearching({state: false, message: ""});
    };

    const handleSearchPhrase = (evt) => {
        setSearchPhrase(evt.target.value);
    };

    const handleScope = e => {
        if (e.target.checked) {
            setSearchScope(e.target.value)
        }
    }

    const handleGoToPassage = (psg: Passage) => {
        dispatcher(stateActions.setChapterSelection({book: psg.bookName, chapter: psg.chapter, translation: psg.translationId, verse: psg.startVerse}));
        navigate("/readChapter");
    };

    const handleMailResults = async () => {
        const formattedSearchResults: string[][] = [];
        for (const psg of searchResults.results) {
            const psgString = PassageUtils.getPassageStringNoIndex(psg,true, false);
            const formattedPsgText = PassageUtils.getFormattedPassageTextHighlight(psg, searchPhrase, false);
            formattedSearchResults.push([psgString, formattedPsgText]);
        }
		setEmailInputModalOpen(false);
        const param: {emailTo: string, searchResults: string[][], searchParam:{book: string, translation: string, testament: string, searchPhrase: string, user: string}} = {
            emailTo: emailToSendTo,
            searchResults: formattedSearchResults,
            searchParam: {
                book: book,
                translation: translation,
                testament: searchScope,
                searchPhrase: searchPhrase,
                user: user
            }
        };
        setSearching({state: true, message: "Sending search results..."});
        const sendResult = await memoryService.sendResults(param);
        console.log("Here is the result from the sendResults call: " + sendResult.data);
        if (sendResult.data === "success") {
            Modal.info({
                title: "Sent Results",
                content: "The search results have been sent to " + param.emailTo,
            });
        } else {
            Modal.error({
                title: "Error Sending Results",
                content: "The search results error'd out while to " + param.emailTo + ".  Message: " + sendResult.data,
            });
        }
        setSearching({state: false, message: ""});
    };

    if (searching.state) {
        return <SpinnerTimer message={searching.message}/>;
    } else {
        return (
            <>
                <Row justify="center">
                    <h1>Bible Search</h1>
                </Row>
				<Modal
					title={
					  <div
						style={{
						  width: '100%',
						  cursor: 'move',
						}}
						onMouseOver={() => {
						  if (disabled) {
							setDisabled(false);
						  }
						}}
						onMouseOut={() => {
						  setDisabled(true);
						}}
						// fix eslintjsx-a11y/mouse-events-have-key-events
						// https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
						onFocus={() => {}}
						onBlur={() => {}}
						// end
					  >
						Enter Email
					  </div>
					}
					open={emailInputModalOpen}
					onCancel={() => setEmailInputModalOpen(false)}
					onOk={() => {
						// Handle the entered text as needed
						console.log('Entered text:', emailToSendTo);
						// Additional logic or API calls can be added here
                        handleMailResults();
					}}
					modalRender={(modal) => (
						<Draggable
							disabled={disabled}
							bounds={bounds}
							nodeRef={draggleRef}
							onStart={(event, uiData) => onStart(event, uiData)}
						>
							<div ref={draggleRef}>{modal}</div>
						</Draggable>
					)}
				>
					<Input
                        placeholder="Enter email address to send to"
                        value={emailToSendTo}
                        onChange={(evt) => setEmailToSendTo(evt.target.value)} />
				</Modal>
                <Row>
                    <h3>Section of Bible to Search:</h3>
                </Row>
                <Row>
                    <Radio value="new" checked={searchScope === "new"} onChange={handleScope}>NT</Radio>
                    <Radio value="old" checked={searchScope === "old"} onChange={handleScope}>OT</Radio>
                    <Radio value="both" checked={searchScope === "both"} onChange={handleScope}>Full</Radio>
                    <Radio value="gospels" checked={searchScope === "gospels"}
                           onChange={handleScope}>Gospels</Radio>
                    <Radio value="pauls_letters" checked={searchScope === "pauls_letters"} onChange={handleScope}>Paul's
                        Letters</Radio>
                    <Radio value="non_pauline_letters" checked={searchScope === "non_pauline_letters"}
                           onChange={handleScope}>Non-Pauline Letters</Radio>
                </Row>
                <Divider/>
                <Row style={{marginBottom: "5px"}}>
                    <Col style={{fontWeight: "bold", marginRight: "5px"}} span={8}>Book:</Col>
                    <Col span={12}>
                        <Select style={{width: "100%"}} size="small" defaultValue={book} value={book}
                                onChange={handleBookChange}>
                            <Option value="All">{"ALL"}</Option>
                            {Object.keys(Constants.bookAbbrev).map(key => (
                                    <Option key={key} value={key}>{Constants.bookAbbrev[key][1]}</Option>
                                )
                            )}
                        </Select>
                    </Col>
                </Row>
                <Row style={{marginBottom: "5px"}}>
                    <Col style={{fontWeight: "bold", marginRight: "5px"}} span={8}>Translation:</Col>
                    <Col span={12}>
                        <Select style={{width: "100%"}} size="small" value={translation}
                                onChange={handleTranslationChange}>
                            <Option value="all">{"ALL"}</Option>
                            {Object.keys(Constants.translationLongNames).map(key => (
                                    <Option key={key} value={key}>{Constants.translationLongNames[key]}</Option>
                                )
                            )}
                        </Select>
                    </Col>
                </Row>
                <Divider/>
                <Row style={{marginBottom: "5px"}}>
                    <Col span={24}>
                        <TextArea
                            style={{marginLeft: "5px", marginRight: "5px"}}
                            autoSize={{minRows: 2, maxRows: 6}}
                            placeholder="Enter search phrase (wild cards allowed)"
                            autoFocus
                            value={searchPhrase}
                            onChange={handleSearchPhrase}/>
                    </Col>
                </Row>
                <Divider/>
                <Row>
                    <Col>
                        <Button icon={<SearchOutlined/>} onClick={handleSearch}>Search</Button>
                    </Col>
                </Row>
                {searchResults.visible &&
                    <>
                        <Divider/>
                        {(!searchResults.results || searchResults.results.length === 0) && <Row><p>No matches</p></Row>}
                        {searchResults.results && searchResults.results.length > 0 &&
                            <>
                            <Row><p style={{fontWeight: "bold"}}>({searchResults.results.length} matches)</p></Row>
                            <Row>
                                <Col>
                                    <Button icon={<MailOutlined/>} onClick={() => setEmailInputModalOpen(true)}>E-Mail Results</Button>
                                </Col>
                            </Row>
                            </>}
                        {searchResults.results && searchResults.results.length > 0 && searchResults.results.map((psg: Passage) => {
                                const psgString = PassageUtils.getPassageStringNoIndex(psg,true, false);
                                const formattedPsgText = PassageUtils.getFormattedPassageTextHighlight(psg, searchPhrase, false);

                                return (
                                    <React.Fragment key={psgString}>
                                        <Row>
                                            <Col style={{marginRight: "3px"}}>
                                                <a style={{cursor: "pointer"}} onClick={() => handleGoToPassage(psg)}>{psgString}</a>
                                            </Col>
                                            <Col dangerouslySetInnerHTML={{__html: formattedPsgText}}/>
                                        </Row>
                                        <Divider/>
                                    </React.Fragment>
                                );
                            }
                        )}
                    </>
                }
            </>
        );
    }
};

export default BibleSearch;