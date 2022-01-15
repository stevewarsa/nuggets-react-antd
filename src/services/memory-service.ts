import axios from "axios";
import {Passage} from "../model/passage";

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
}
export default new MemoryService();
