import axios from "axios";
import {Passage} from "../model/passage";
import {Constants} from "../model/constants";

class MemoryService {
    public getMemoryPsgList(user: string) {
        return axios.get("/nuggets/server/get_mempsg_list.php?user=" + user);
    }

    public getPassage(passage: Passage, user: string) {
        // console.log("MemoryService.getPassage - calling /nuggets/server/get_passage_text.php?user=" + user + "&translation=" + passage.translationName + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse);
        return axios.get("/nuggets/server/get_passage_text.php?user=" + user + "&translation=" + passage.translationName + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse);
    }

    public getMemoryPassageTextOverrides(user: string) {
        return axios.get("/nuggets/server/get_mempsg_text_overrides.php?user=" + user);
    }

    public getMaxChaptersByBook() {
        return axios.get("/nuggets/server/get_max_chapter_by_book.php");
    }
    public getChapter(book: string, chapter: number, translation: string) {
        let bookId: number = this.getBookId(book);
        return axios.get("/nuggets/server/get_chapter.php?bookId=" + bookId + "&chapter=" + chapter + "&translation=" + translation);
    }

    public getReadingPlanProgress(user: string, dayOfWeek: string) {
        return axios.get("/nuggets/server/get_reading_plan_progress.php?user=" + user + "&dayOfWeek=" + dayOfWeek);
    }

    public getAllReadingPlanProgress(user: string) {
        return axios.get("/nuggets/server/get_all_reading_plan_progress.php?user=" + user);
    }

    public updateReadingPlan(user: string, dayOfWeek: string, book: string, bookId: number, chapter: number) {
        return axios.get("/nuggets/server/update_reading_plan.php?user=" + user + "&dayOfWeek=" + dayOfWeek + "&book=" + book + "&bookId=" + bookId + "&chapter=" + chapter);
    }

    public getPreferences(user: string) {
        return axios.get("/nuggets/server/get_preferences.php?user=" + user);
    }

    public getBookId(bookName: string): number {
        let keys: string[] = Object.keys(Constants.booksByNum);
        for (let key of keys) {
            let keyNum: number = parseInt(key);
            let foundBookName: string = Constants.booksByNum[key];
            if (bookName === foundBookName) {
                return keyNum;
            }
        }
        return -1;
    }

}
export default new MemoryService();
