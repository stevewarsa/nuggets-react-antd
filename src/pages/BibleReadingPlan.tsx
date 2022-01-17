import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {DateUtils} from "../helpers/date.utils";
import {Constants} from "../model/constants";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {PassageUtils} from "../helpers/passage-utils";
import {Button, Col, Row} from "antd";

interface ReadingHistoryEntry {
    bookId: number;
    bookName: string;
    chapter: number;
    dateRead: string;
    dayOfWeek: string;
}

const BibleReadingPlan = () => {
    const maxChaptersByBook = useSelector((state: AppState) => state.maxChaptersByBook);
    const currentDayOfWeek = DateUtils.getDayOfWeek();
    const [allReadingPlanProgress, setAllReadingPlanProgress] = useState<ReadingHistoryEntry[]>([]);
    const [todaysReading, setTodaysReading] = useState<ReadingHistoryEntry>(null);
    const [translation, setTranslation] = useState("niv");

    useEffect(() => {
        const callServer = async () => {
            const allReadingPlanProgress = await memoryService.getAllReadingPlanProgress(Constants.USER);
            const data: ReadingHistoryEntry[] = allReadingPlanProgress.data as ReadingHistoryEntry[];
            setAllReadingPlanProgress(data);
            let nextReadingEntry: ReadingHistoryEntry;
            let readingEntriesForTodaysGroup = data.filter(re => re.dayOfWeek === currentDayOfWeek);
            if (readingEntriesForTodaysGroup.length === 0) {
                // this person has never read anything for this day of the week, so pick the
                // first chapter of the first book from today's group
                const bookToRead = Constants.booksByDay[currentDayOfWeek][0];
                nextReadingEntry = {
                    bookName: bookToRead,
                    bookId: Object.keys(Constants.booksByNum)
                        .map(key => Constants.booksByNum[parseInt(key)])
                        .find(bk => bk === bookToRead),
                    chapter: 1,
                    dayOfWeek: currentDayOfWeek,
                    dateRead: DateUtils.formatDate(new Date(), "yyyy-MM-dd")
                } as ReadingHistoryEntry;
            } else {
                // person has a reading history, so pick up where we left off - 1st find the one they read last week
                nextReadingEntry = readingEntriesForTodaysGroup[0];
                const maxChap = maxChaptersByBook.find(mx => mx.bookName === nextReadingEntry.bookName).maxChapter;
                if (nextReadingEntry.chapter === maxChap) {
                    // go to next book
                    let currentBookIndex = Constants.booksByDay[currentDayOfWeek].findIndex(bk => bk === nextReadingEntry.bookName);
                    if (currentBookIndex === (Constants.booksByDay[currentDayOfWeek].length - 1)) {
                        // User had been reading last book in series for this day of week, so go back to 1st book in series
                        nextReadingEntry.bookName = Constants.booksByDay[currentDayOfWeek][0];
                    } else {
                        nextReadingEntry.bookName = Constants.booksByDay[currentDayOfWeek][currentBookIndex + 1]
                    }
                    // since we're going to new book, start at chapter 1
                    nextReadingEntry.chapter = 1;
                    nextReadingEntry.bookId = Object.keys(Constants.booksByNum)
                        .map(key => Constants.booksByNum[parseInt(key)])
                        .find(bk => bk === nextReadingEntry.bookName);
                } else {
                    // staying in same book so just increment chapter
                    nextReadingEntry.chapter++;
                }
                nextReadingEntry.dateRead = DateUtils.formatDate(new Date(), "yyyy-MM-dd");
            }
            setTodaysReading(nextReadingEntry);
            const preferencesResponse = await memoryService.getPreferences(Constants.USER);
            setTranslation(PassageUtils.getPreferredTranslationFromPrefs(preferencesResponse.data, "niv"));
        };
        callServer();
    }, []);

    const handleRead = () => {
        console.log("handleRead - translation:");
        console.log(translation);
    };

    return (
        <>
            {todaysReading &&
                <>
                    <h2>Today's Reading</h2>
                    <h3>{todaysReading.bookName + " " + todaysReading.chapter}</h3>
                    <Row>
                        <Col><Button type="primary" onClick={handleRead}>Read</Button></Col>
                    </Row>
                </>
            }
            {allReadingPlanProgress && allReadingPlanProgress.length > 0 &&
                <>
                    <h3>Reading Plan Progress</h3>
                    <Row justify="center">
                        <Col span={12} style={{fontWeight: "bolder", textDecoration: "underline"}}>Day/Date</Col>
                        <Col span={12} style={{fontWeight: "bolder", textDecoration: "underline"}}>Chapter Read</Col>
                    </Row>
                    {allReadingPlanProgress.map(p =>
                        <Row justify="center" key={p.dateRead + "row" + p.chapter}>
                            <Col span={12} key={p.dateRead + "col1" + p.chapter}>{p.dayOfWeek + " " + p.dateRead}</Col>
                            <Col span={12} key={p.dateRead + "col2" + p.chapter}>{p.bookName + " " + p.chapter}</Col>
                        </Row>
                    )}
                </>
            }
        </>
    );
};

export default BibleReadingPlan;