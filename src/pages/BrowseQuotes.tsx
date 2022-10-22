import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {
    Button,
    Col,
    Dropdown,
    Menu, MenuProps,
    Row,
    Space
} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined, EditOutlined,
    EyeInvisibleOutlined, FilterOutlined, MailOutlined,
    MoreOutlined,
    SearchOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import useBrowseQuotes from "../hooks/use-browse-quotes";
import QuoteTagsModal from "../components/QuoteTagsModal";
import EditQuote from "../components/EditQuote";
import SendQuote from "../components/SendQuote";
import FilterByTag from "../components/FilterByTag";

const BrowseQuotes = () => {
    const {
        isFiltered,
        filteredQuotes,
        busy,
        editingQuote,
        setEditingQuote,
        selectTagsVisible,
        setSelectTagsVisible,
        sendQuoteVisible,
        setSendQuoteVisible,
        filterByTagVisible,
        setFilterByTagVisible,
        searchString,
        currentIndex,
        handleSearch,
        handleClearFilter,
        handleMenuClick,
        handlePrev,
        handleNext,
    } = useBrowseQuotes();

    const items: MenuProps["items"] = [
        {label: "Copy", key: "copy", icon: <CopyOutlined/>},
        {label: "Send Quote...", key: "send", icon: <MailOutlined />},
        {label: "Edit Quote...", key: "edit", icon: <EditOutlined />},
        {label: "Topics...", key: "topics", icon: <UnorderedListOutlined />},
        {label: "Filter By Tag...", key: "filterbytag", icon: <FilterOutlined />}
    ];

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message}/>}
            <Row justify="center">
                <h1>Browse Quotes</h1>
            </Row>
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                    <Col>{currentIndex + 1} of {filteredQuotes.length}</Col>
                    <Col style={{marginLeft: "5px"}}><Button icon={<SearchOutlined/>} onClick={handleSearch}/></Col>
                </Row>
                <Row justify="center">
                    <Space>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                        <Col span={6}><Button disabled={!isFiltered} icon={<EyeInvisibleOutlined/>}
                                              onClick={handleClearFilter}/></Col>
                        <Col span={6}>
                            <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick} items={items}/>
                            }>
                                <MoreOutlined style={{
                                    borderStyle: "solid",
                                    borderWidth: "thin",
                                    borderColor: "gray",
                                    padding: "7px",
                                    backgroundColor: "white"
                                }}/>
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {filteredQuotes && filteredQuotes.length > currentIndex && !StringUtils.isEmpty(filteredQuotes[currentIndex].quoteTx) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={"filtered-quotes-" + currentIndex}
                        >
                            <Row key={"filtered-quotes-" + currentIndex}>
                                <Col span={24}>
                                    <p
                                        style={{marginTop: "10px", overflow: "hidden"}}
                                        className="nugget-view"
                                        dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(StringUtils.isEmpty(searchString) ? filteredQuotes[currentIndex].quoteTx : PassageUtils.updateAllMatches(searchString, filteredQuotes[currentIndex].quoteTx))}}/>
                                </Col>
                            </Row>
                        </CSSTransition>
                    </SwitchTransition>
                }
            </Swipe>
            {/*Down here are all the modals that can be popped up (Tags, Edit Quote, Send Quote)*/}
            <QuoteTagsModal props={{
                currentQuote: filteredQuotes[currentIndex],
                visible: selectTagsVisible,
                setVisibleFunction: setSelectTagsVisible
            }} />
            <EditQuote props={{
                currentQuote: filteredQuotes[currentIndex],
                visible: editingQuote,
                setVisibleFunction: setEditingQuote
            }} />
            <SendQuote props={{
                currentQuote: filteredQuotes[currentIndex],
                visible: sendQuoteVisible,
                setVisibleFunction: setSendQuoteVisible
            }} />
            <FilterByTag props={{
                visible: filterByTagVisible,
                setVisibleFunction: setFilterByTagVisible
            }} />
        </>
    );
};

export default BrowseQuotes;