import {Button, Col, Divider, Input, Radio, Row, Select} from "antd";
import {useEffect, useState} from "react";
import {Constants} from "../model/constants";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import {SearchOutlined} from "@ant-design/icons";

const BibleSearch = () => {
    const {Option} = Select;
    const [searchScope, setSearchScope] = useState("both");
    const [book, setBook] = useState("all");
    const [translation, setTranslation] = useState("all");
    const [searchPhrase, setSearchPhrase] = useState("");
    const prefs = useSelector((state: AppState) => state.userPreferences);

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

    const handleSearch = (evt) => {
        setSearchPhrase(evt.target.value);
    };

    const handleSearchPhrase = () => {
    };

    return (
        <>
            <Row justify="center">
                <h1>Bible Search</h1>
            </Row>
            <Row>
                <h3>Section of Bible to Search:</h3>
            </Row>
            <Row>
                <Radio value="new" checked={searchScope === "new"}>NT</Radio>
                <Radio value="old" checked={searchScope === "old"}>OT</Radio>
                <Radio value="both"  checked={searchScope === "both"}>Full</Radio>
                <Radio value="gospels" checked={searchScope === "gospels"}>Gospels</Radio>
                <Radio value="pauls_letters"  checked={searchScope === "pauls_letters"}>Paul's Letters</Radio>
                <Radio value="non_pauline_letters" checked={searchScope === "non_pauline_letters"}>Non-Pauline Letters</Radio>
            </Row>
            <Divider />
            <Row style={{marginBottom: "5px"}}>
                <Col style={{fontWeight: "bold", marginRight: "5px"}} span={8}>Book:</Col>
                <Col span={12}>
                    <Select style={{width: "100%"}} size="small" defaultValue={book} value={book} onChange={handleBookChange}>
                        <Option value="all">{"ALL"}</Option>
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
                    <Select style={{width: "100%"}} size="small" value={translation} onChange={handleTranslationChange}>
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
                <Col style={{fontWeight: "bold", marginRight: "5px"}}>Search Phrase:</Col>
                <Col><Input autoFocus size="small" value={searchPhrase} onChange={handleSearchPhrase}/></Col>
            </Row>
            <Divider/>
            <Row>
                <Col>
                    <Button icon={<SearchOutlined />} onClick={handleSearch}>Search</Button>
                </Col>
            </Row>
        </>
    );
};

export default BibleSearch;