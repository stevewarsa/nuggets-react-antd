import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {Passage} from "../model/passage";
import {Constants} from "../model/constants";
import {Quote} from "../model/quote";
import {MemUser} from "../model/mem-user";
import axiosRetry from "axios-retry";
import {UpdatePassageParam} from "../model/update-passage-param";
import {Topic} from "../model/topic";
import {StringUtils} from "../helpers/string.utils";

class MemoryService {
    public getMemoryPsgList(user: string) {
        return MemoryService.buildAxios().get<Passage[]>("/bible-app/server/get_mempsg_list.php?user=" + user);
    }

    public getPassage(passage: Passage, user: string) {
        return MemoryService.buildAxios().get<Passage>("/bible-app/server/get_passage_text.php?user=" + user + "&translation=" + passage.translationName + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse);
    }

    public getMemoryPassageTextOverrides(user: string) {
        return MemoryService.buildAxios().get<Passage[]>("/bible-app/server/get_mempsg_text_overrides.php?user=" + user);
    }

    public updateLastViewed(userName: string, passageId: number, lastViewedNum: number, lastViewedString: string) {
        let encodedLastViewedString = encodeURIComponent(lastViewedString);
        return MemoryService.buildAxios().get<string>("/bible-app/server/update_last_viewed.php?user=" + userName + "&passageId=" + passageId + "&lastViewedNum=" + lastViewedNum + "&lastViewedStr=" + encodedLastViewedString);
    }

    public getMemoryPracticeHistory(userName: string) {
        return MemoryService.buildAxios().get("/bible-app/server/get_mem_practice_history.php?user=" + userName);
    }

    public getMaxChaptersByBook() {
        return MemoryService.buildAxios().get("/bible-app/server/get_max_chapter_by_book.php");
    }

    public getMaxVerseByBookChapter(translation: string) {
        return MemoryService.buildAxios().get<any[]>("/bible-app/server/get_max_verse_by_book_chapter.php?translation=" + translation);
    }

    public getChapter(book: string, chapter: number, translation: string) {
        let bookId: number = this.getBookId(book);
        return MemoryService.buildAxios().get("/bible-app/server/get_chapter.php?bookId=" + bookId + "&chapter=" + chapter + "&translation=" + translation);
    }

    public getAllReadingPlanProgress(user: string) {
        return MemoryService.buildAxios().get("/bible-app/server/get_all_reading_plan_progress.php?user=" + user);
    }

    public updateReadingPlan(user: string, dayOfWeek: string, book: string, bookId: number, chapter: number) {
        return MemoryService.buildAxios().get("/bible-app/server/update_reading_plan.php?user=" + user + "&dayOfWeek=" + dayOfWeek + "&book=" + book + "&bookId=" + bookId + "&chapter=" + chapter);
    }

    public getPreferences(user: string) {
        return MemoryService.buildAxios().get("/bible-app/server/get_preferences.php?user=" + user);
    }

    public updatePreference(user: string, prefNm: string, prefVal: string) {
        return MemoryService.buildAxios().post("/bible-app/server/update_preference.php", {user: user, prefNm: prefNm, prefVal: prefVal});
    }

    public getQuoteList(userName: string) {
        return MemoryService.buildAxios().get<Quote[]>("/bible-app/server/get_quote_list.php?user=" + userName);
    }

    public addNonBibleQuote(quote: any, user: string) {
        quote.user = user;
        quote.category = 'quote';
        return MemoryService.buildAxios().post("/bible-app/server/add_nonbible_memory_fact.php", quote);
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

    public getAllUsers() {
        return MemoryService.buildAxios().get<MemUser[]>("/bible-app/server/get_all_users.php");
    }

    // Note - the return value of this method is the new passage id (-1 if not successful, otherwise a positive integer)
    public addMemoryPassage(passage: Passage, userName: string) {
        return MemoryService.buildAxios().get<number>("/bible-app/server/add_memory_passage.php?user=" + userName + "&translation=" + passage.translationId + "&book=" + passage.bookName + "&chapter=" + passage.chapter + "&start=" + passage.startVerse + "&end=" + passage.endVerse + "&queue=N");
    }

    public addQuoteTopics(topics: Topic[], quoteId: number, userName: string) {
        return MemoryService.buildAxios().post<{quoteId: number, topics: Topic[], message: string}>("/bible-app/server/add_quote_topic.php", {user: userName, topics: topics, quoteId: quoteId});
    }

    public removeQuoteTopic(topic: Topic, quoteId: number, userName: string) {
        return MemoryService.buildAxios().post<{quoteId: number, topic: Topic, message: string}>("/bible-app/server/remove_quote_topic.php", {user: userName, topic: topic, quoteId: quoteId});
    }

    public removeQuote(quoteId: number, userName: string) {
        return MemoryService.buildAxios().post<{quoteId: number, message: string}>("/bible-app/server/remove_quote.php", {user: userName, quoteId: quoteId});
    }

    public addEmailMapping(param: any) {
        return MemoryService.buildAxios().post<string>("/bible-app/serveadd_email_mapping.php", param);
    }

    public getEmailMappings(param: any) {
        return MemoryService.buildAxios().post<any[]>("/bible-app/server/get_email_mappings.php", param);
    }

    public doLogin(userName: string, copyUser: string) {
        return MemoryService.buildAxios().get<string>("/bible-app/server/nuggets_login.php?user=" + userName + (StringUtils.isEmpty(copyUser) ? "" :  "&copyUser=" + copyUser));
    }

    public searchBible(searchParam: any) {
        return MemoryService.buildAxios().post<Passage[]>("/bible-app/server/bible_search.php", searchParam);
    }

    public copyDbToGuestDb() {
        return MemoryService.buildAxios().get<string>("/bible-app/server/copy_db_to_another.php?dbSource=SteveWarsa&dbDest=Guest");
    }

    public getNuggetIdList(currentUser: string) {
        return MemoryService.buildAxios().get<any[]>("/bible-app/server/get_nugget_id_list.php?user=" + currentUser);
    }

    public getPassageById(passageId: number, selectedTranslation: string, currentUser: string) {
        return MemoryService.buildAxios().get<Passage>("/bible-app/server/get_nugget_by_id.php?user=" + currentUser + "&nugget_id=" + passageId + "&translation=" + selectedTranslation);
    }

    public sendQuoteToUser(param: any) {
        return MemoryService.buildAxios().post<string>("/bible-app/server/send_quote_to_user.php", param);
    }

    public sendResults(param: {emailTo: string, searchResults: string[][], searchParam:{book: string, translation: string, testament: string, searchPhrase: string, user: string}}) {
        return MemoryService.buildAxios().post<string>("/bible-app/server/send_search_results.php", param);
    }

    public updateQuote(quote: Quote, currentUser: string) {
        let param = {user: currentUser, quote: quote};
        return MemoryService.buildAxios().post<string>("/bible-app/server/update_quote.php", param);
    }

    public getTopicList(currentUser: string) {
        return MemoryService.buildAxios().get<Topic[]>("/bible-app/server/get_tag_list.php?user=" + currentUser);
    }

    public getPassagesForTopic(topicId: number, currentUser: string) {
        return MemoryService.buildAxios().get<Passage[]>("/bible-app/server/get_tag_list.php?tagId=" + topicId + '&user=' + currentUser);
    }

    public removePassageTopic(topic: Topic, passageId: number, userName: string) {
        return MemoryService.buildAxios().post<{passageId: number, topic: Topic, message: string}>("/bible-app/server/remove_passage_topic.php", {user: userName, topic: topic, passageId: passageId});
    }

    public addPassageTopics(topicIds: number[], passageId: number, userName: string) {
        return MemoryService.buildAxios().post<string>("/bible-app/server/add_passage_topic.php", {user: userName, topicIds: topicIds, passageId: passageId});
    }

    public addNewPassageTopic(topic: Topic, passageId: number, userName: string) {
        return MemoryService.buildAxios().post<{message: string, topic: Topic, passageId: number}>("/bible-app/server/add_new_passage_topic.php", {user: userName, topic: topic, passageId: passageId});
    }

    public updatePassage(updatePassageParam: UpdatePassageParam) {
        return MemoryService.buildAxios().post<string>("/bible-app/server/update_passage.php", updatePassageParam);
    }

    private static buildAxios(): AxiosInstance {
        // implement 15 second timeout
        const config: AxiosRequestConfig = {
            timeout: 12000
        } as AxiosRequestConfig;
        let axiosInstance = axios.create(config);
        axiosRetry(axiosInstance, {
            retries: 3,
            shouldResetTimeout: true,
            retryCondition: (_error) => true // retry no matter what
        });
        return axiosInstance;
    }
}
export default new MemoryService();
