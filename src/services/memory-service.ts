import axios from "axios";
import {Passage} from "../model/passage";

class MemoryService {
    public getMemoryPsgList() {
        return axios.get("/nuggets/server/get_mempsg_list.php?user=SteveWarsa");
    }

    public getPassage(passage: Passage, user: string) {
        console.log("MemoryService.getPassage - calling /nuggets/server/get_passage_text.php?user=" + user + "&translation=" + passage.translationName + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse);
        return axios.get("/nuggets/server/get_passage_text.php?user=" + user + "&translation=" + passage.translationName + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse);
    }
}
export default new MemoryService();
