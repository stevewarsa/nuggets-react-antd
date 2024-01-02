import {Col, Modal, Row, Tree} from "antd";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {useEffect, useState} from "react";
import type { DataNode, TreeProps } from 'antd/es/tree';
import {Constants} from "../model/constants";
import useMemoryPassages from "../hooks/use-memory-passages";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import SpinnerTimer from "../components/SpinnerTimer";
import memoryService from "../services/memory-service";

const buildTree = (memPsgList: Passage[], maxChaptersByBook: {bookName: string, maxChapter: number}[]) => {
    const locTreeData: DataNode[] = [];
    for (let key in Constants.bookAbbrev) {
        const book = Constants.bookAbbrev[key];
        const matchingPassagesForBook = memPsgList.filter(psg => psg.bookName === key);
        if (matchingPassagesForBook?.length === 0) {
            continue;
        }
        const bookNode = {title: book[1] + " (" + matchingPassagesForBook.length + ")", key: key} as DataNode;
        const maxChap = maxChaptersByBook.find(mx => mx.bookName === key).maxChapter;
        let chapters = Array.from({length: maxChap}, (e, i) => i + 1);
        const bookChildren: DataNode[] = [];
        for (let chapter of chapters) {
            const matchingPassagesForChapter = memPsgList.filter(psg => psg.chapter === chapter && psg.bookName === key);
            if (matchingPassagesForChapter?.length === 0) {
                continue;
            }
            const chapNode = {
                title: chapter + " (" + matchingPassagesForChapter.length + ")",
                key: key + "|" + chapter,
                isLeaf: false
            } as DataNode;
            const chapterChildren: DataNode[] = [];
            const sortedPassages = matchingPassagesForChapter.sort((a, b) => a.startVerse - b.startVerse);
            for (let psg of sortedPassages) {
                const psgRef = PassageUtils.getPassageString(psg, 1, matchingPassagesForChapter.length, psg.translationId, true, false, psg.passageRefAppendLetter);
                const psgNode = {title: psgRef, key: key + "|" + chapter + "|" + psg.passageId, isLeaf: true};
                chapterChildren.push(psgNode);
            }
            chapNode.children = chapterChildren;
            bookChildren.push(chapNode);
        }
        bookNode.children = bookChildren;
        locTreeData.push(bookNode);
    }
    return locTreeData;
}
const {DirectoryTree} = Tree;

const PracticeByBook = () => {
    // this (maxChaptersByBook) is loaded in App.tsx and should not change...
    const maxChaptersByBook = useSelector((state: AppState) => state.maxChaptersByBook);
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [overrides, setOverrides] = useState<Passage[]>([]);
    const [memPsgs, setMemPsgs] = useState<Passage[]>([]);
    const [psgTxtVisible, setPsgTxtVisible] = useState<boolean>(false);
    const [psgTxt, setPsgTxt] = useState<string>("N/A");

    useEffect(() => {
        console.log("PracticeByBook.useEffect[] - loading tree...");
        setBusy({state: true, message: "Loading memory passages from DB..."});
        getMemPassages(user, true).then(resp => {
            const memPsgList: Passage[] = resp.passages;
            if (memPsgList) {
                setMemPsgs(memPsgList);
            }
            const memPsgTxtOverrideList: Passage[] = resp.overrides;
            if (memPsgTxtOverrideList) {
                setOverrides(memPsgTxtOverrideList);
            }

            setTreeData(buildTree(memPsgList, maxChaptersByBook));
            setBusy({state: false, message: ""});
        });
    }, []);

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        const keyParts = (info.node.key + "").split("|");
        if (keyParts.length >= 3) {
            const passageId = parseInt(keyParts[2]);
            const currPsg = memPsgs.find(p => p.passageId === passageId);
            const override = overrides.find(p => p.passageId === currPsg.passageId);
            if (override) {
                // this is an override, so we don't need to call the server, just update the verses from the override
                currPsg.verses = override.verses;
                setPsgTxt(PassageUtils.getPassageForClipboard(currPsg, false));
                setPsgTxtVisible(true);
            } else {
                setBusy({state: true, message: "Loading memory passage text from DB..."});
                memoryService.getPassage(currPsg, user).then(resp => {
                    currPsg.verses = resp.data.verses;
                    setPsgTxt(PassageUtils.getPassageForClipboard(currPsg, false));
                    setPsgTxtVisible(true);
                    setBusy({state: false, message: ""});
                });
            }
        }
    };

    return (
        <>
            <Row justify="center"><h1>Practice By Book</h1></Row>
            {busy.state && <Row justify="center"><SpinnerTimer message={busy.message} /></Row>}
            <Row><DirectoryTree treeData={treeData} onSelect={onSelect} /></Row>
            <Modal footer={null} title="Passage Text" open={psgTxtVisible} onCancel={() => setPsgTxtVisible(false)}>
                <Row>
                    <Col span={24}>
                        {psgTxt}
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default PracticeByBook;