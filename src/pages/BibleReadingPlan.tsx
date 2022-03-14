import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {DateUtils} from "../helpers/date.utils";
import {Constants} from "../model/constants";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {PassageUtils} from "../helpers/passage-utils";
import {Button, Card, Col, Divider, Row} from "antd";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import SpinnerTimer from "../components/SpinnerTimer";

interface ReadingHistoryEntry {
    bookId: number;
    bookName: string;
    chapter: number;
    dateRead: string;
    dayOfWeek: string;
}

const BibleReadingPlan = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const maxChaptersByBook = useSelector((state: AppState) => state.maxChaptersByBook);
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const currentDayOfWeek = DateUtils.getDayOfWeek();
    const [allReadingPlanProgress, setAllReadingPlanProgress] = useState<ReadingHistoryEntry[]>([]);
    const [todaysReading, setTodaysReading] = useState<ReadingHistoryEntry>(null);
    const [translation, setTranslation] = useState("niv");
    const [busy, setBusy] = useState({state: false, message: ""});
    const user = useSelector((state: AppState) => state.user);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Loading reading plan history..."});
            const allReadingPlan = await memoryService.getAllReadingPlanProgress(user);
            const data: ReadingHistoryEntry[] = allReadingPlan.data as ReadingHistoryEntry[];
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
                // (clone it so we don't modify the one in the list)
                nextReadingEntry = JSON.parse(JSON.stringify(readingEntriesForTodaysGroup[0]));
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
            setTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [currentDayOfWeek, maxChaptersByBook, user]);

    const handleRead = async () => {
        setBusy({state: true, message: "Updating reading plan progress..."});
        const response = await memoryService.updateReadingPlan(user, todaysReading.dayOfWeek, todaysReading.bookName, todaysReading.bookId, todaysReading.chapter);
        if (response.data === "success") {
            dispatcher(stateActions.setChapterSelection({book: todaysReading.bookName, chapter: todaysReading.chapter, translation: translation}));
            setBusy({state: false, message: ""});
            navigate("/readChapter");
        } else {
            console.log("Got back " + response.data + " from server.  Not forwarding to /readChapter");
            setBusy({state: false, message: ""});
        }
    };

    const goToChapter = (entry: ReadingHistoryEntry) => {
        dispatcher(stateActions.setChapterSelection({book: entry.bookName, chapter: entry.chapter, translation: translation}));
        navigate("/readChapter");
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <>
                {todaysReading &&
                    <>
                        <Row justify="center">
                            <h1>Today's Reading</h1>
                        </Row>
                        <Row justify="center">
                            <h3>{Constants.bookAbbrev[todaysReading.bookName][1] + " " + todaysReading.chapter}</h3>
                        </Row>
                        <Row justify="center">
                            <Col><Button disabled={user === Constants.GUEST_USER} type="primary" onClick={handleRead}>Read</Button></Col>
                        </Row>
                    </>
                }
                {allReadingPlanProgress && allReadingPlanProgress.length > 0 &&
                    <>
                        <Divider/>
                        <h3>Reading History</h3>
                        {allReadingPlanProgress.map(p =>
                            <Card style={{cursor: "pointer"}} onClick={() => goToChapter(p)} key={p.dateRead + "row" + p.chapter} size="small"
                                  title={p.dayOfWeek + " " + p.dateRead}>
                                <p key={p.dateRead + "col1" + p.chapter}>{Constants.bookAbbrev[p.bookName][1] + " " + p.chapter}</p>
                            </Card>
                        )}
                    </>
                }
            </>
        );
    }
};

export default BibleReadingPlan;