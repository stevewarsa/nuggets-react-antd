import {TweenOneGroup} from "rc-tween-one";
import {Divider, Input, InputRef, Modal, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {Quote} from "../model/quote";
import useQuoteTagsModal from "../hooks/use-quote-tags-modal";
import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

interface QuoteTagsProps {
    currentQuote: Quote;
    visible: boolean;
    setVisibleFunction: Function;
}

const QuoteTagsModal = ({props}: {props: QuoteTagsProps}) => {
    const {
        tagInputVisible,
        tagInputValue,
        quoteTagsVisible,
        addExistingTagToQuote,
        handleTagInputChange,
        handleTagInputConfirm,
        handleTagOk,
        handleTagCancel,
        showTagInput,
        handleClose
    } = useQuoteTagsModal(props.currentQuote, props.visible);
    const allTopics: {id: number, name: string}[] = useSelector((appState: AppState) => appState.topicList);
    const recentTopicsUsed: {id: number, name: string}[] = useSelector((appState: AppState) => appState.recentTopicsUsed);
    const tagInputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (tagInputVisible) {
            tagInputRef.current.focus();
        }
    }, [tagInputVisible]);

    useEffect(() => {
        props.setVisibleFunction(quoteTagsVisible);
    }, [quoteTagsVisible]);

    return (
        <Modal title="Quote Tags" open={quoteTagsVisible} onOk={handleTagOk} onCancel={handleTagCancel}>
            {props.currentQuote && props.currentQuote.tags && props.currentQuote.tags.length > 0 &&
                <fieldset style={{borderStyle: "solid", borderWidth: "1px", marginBottom: "10px", padding: "10px"}}>
                    <legend>Associated Tags</legend>
                    <TweenOneGroup
                        enter={{
                            scale: 0.8,
                            opacity: 0,
                            type: 'from',
                            duration: 100,
                        }}
                        onEnd={e => {
                            if (e.type === 'appear' || e.type === 'enter') {
                                (e.target as any).style = 'display: inline-block';
                            }
                        }}
                        leave={{opacity: 0, width: 0, scale: 0, duration: 200}}
                        appear={false}
                    >
                        {props.currentQuote && props.currentQuote.tags.map(tag => (
                            <span key={tag.id} style={{display: 'inline-block'}}>
                            <Tag
                                key={tag.id}
                                closable
                                onClose={e => {
                                    e.preventDefault();
                                    handleClose(tag);
                                }}
                                style={{marginBottom: "2px"}}
                            >
                                {tag.name}
                            </Tag>
                        </span>
                        ))}
                    </TweenOneGroup>
                </fieldset>
            }
            {tagInputVisible && (
                <Input
                    ref={tagInputRef}
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={tagInputValue}
                    onChange={handleTagInputChange}
                    onBlur={handleTagInputConfirm}
                    onPressEnter={handleTagInputConfirm}
                />
            )}
            {!tagInputVisible && (
                <Tag onClick={showTagInput} className="topic">
                    <PlusOutlined /> New Tag
                </Tag>
            )}
            {props.currentQuote && recentTopicsUsed && recentTopicsUsed.length > 0 && <h3>Recent Topics Used:</h3>}
            {props.currentQuote && recentTopicsUsed && recentTopicsUsed.length > 0 && recentTopicsUsed.filter(tg => !props.currentQuote.tagIds.includes(tg.id)).map(tg => (
                <Tag key={tg.id + "-recent"} onClick={() => addExistingTagToQuote(tg)} className="topic">
                    <PlusOutlined /> {tg.name}
                </Tag>
            ))}
            {props.currentQuote && recentTopicsUsed && recentTopicsUsed.length > 0 && <Divider style={{color: "black"}} dashed />}
            {props.currentQuote && allTopics && allTopics.length > 0 && <h3>All Topics:</h3>}
            {props.currentQuote && allTopics.length > 0 && allTopics.filter(tg => !props.currentQuote.tagIds.includes(tg.id)).map(tg => (
                        <Tag key={tg.id} onClick={() => addExistingTagToQuote(tg)} className="topic">
                            <PlusOutlined/> {tg.name}
                        </Tag>
                    ))
                }
        </Modal>
    );
};

export default QuoteTagsModal;