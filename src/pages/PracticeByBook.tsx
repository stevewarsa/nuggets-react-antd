import {Row, Tree} from "antd";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {useEffect, useState} from "react";
import type { DataNode, TreeProps } from 'antd/es/tree';
import {Constants} from "../model/constants";
import useMemoryPassages from "../hooks/use-memory-passages";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import SpinnerTimer from "../components/SpinnerTimer";


const PracticeByBook = () => {
    // this (maxChaptersByBook) is loaded in App.tsx and should not change...
    const maxChaptersByBook = useSelector((state: AppState) => state.maxChaptersByBook);
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [overrides, setOverrides] = useState<Passage[]>([]);
    const [memPsgs, setMemPsgs] = useState<Passage[]>([]);

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
                for (let chapter in chapters) {
                    const matchingPassagesForChapter = memPsgList.filter(psg => psg.chapter === (parseInt(chapter) + 1) && psg.bookName === key);
                    if (matchingPassagesForChapter?.length === 0) {
                        continue;
                    }
                    const chapNode = {title: (parseInt(chapter) + 1) + " (" + matchingPassagesForChapter.length + ")", key: key + "-" + chapter} as DataNode;
                    const chapterChildren: DataNode[] = [];
                    for (let psg of matchingPassagesForChapter) {
                        const psgRef = PassageUtils.getPassageString(psg, 1, matchingPassagesForChapter.length, psg.translationId, true, false);
                        const psgNode = {title: psgRef, key: key + "-" + chapter + "-" + psg.passageId};
                        chapterChildren.push(psgNode);
                    }
                    chapNode.children = chapterChildren;
                    bookChildren.push(chapNode);
                }
                bookNode.children = bookChildren;
                locTreeData.push(bookNode);
            }
            setTreeData(locTreeData);
            setBusy({state: false, message: ""});
        });
    }, []);

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    return (
        <>
            <Row justify="center"><h1>Practice By Book</h1></Row>
            {busy.state && <Row justify="center"><SpinnerTimer message={busy.message} /></Row>}
            <Row><Tree treeData={treeData} onSelect={onSelect} /></Row>
        </>
    );
};

export default PracticeByBook;