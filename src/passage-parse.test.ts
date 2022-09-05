import {PassageUtils} from "./helpers/passage-utils";

describe("Passage Utils Test Suite", () => {
    beforeEach(() => {
        // TODO: if needed
    });

    it("Book only should return chapter 1 verse 1", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis");
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(1);
        expect(result[0].startVerse).toEqual(1);
        expect(result[0].endVerse).toEqual(1);
    });
    it("Match of partial book should return chapter 1 verse 1", () => {
        let result = PassageUtils.getPassageFromPassageRef("Gen");
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(1);
        expect(result[0].startVerse).toEqual(1);
        expect(result[0].endVerse).toEqual(1);
    });
    it("Book and chapter should return verse1", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis 2");
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(2);
        expect(result[0].startVerse).toEqual(1);
        expect(result[0].endVerse).toEqual(1);
    });
    it("Book, chapter and verse should return all values correctly", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis 2:5");
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(2);
        expect(result[0].startVerse).toEqual(5);
        expect(result[0].endVerse).toEqual(5);
    });
    it("Book, chapter and verse range should return all values correctly", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis 2:5-6");
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(2);
        expect(result[0].startVerse).toEqual(5);
        expect(result[0].endVerse).toEqual(6);
    });
    it("Book and space should return only one result", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis ");
        expect(result.length).toEqual(1);
    });
    it("Book, Chapter and colon should return result with verse 1", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis 2:");
        expect(result.length).toEqual(1);
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(2);
        expect(result[0].startVerse).toEqual(1);
        expect(result[0].endVerse).toEqual(1);
    });
    it("Book, Chapter, colon, start verse and dash should return result with start verse and end verse same", () => {
        let result = PassageUtils.getPassageFromPassageRef("Genesis 2:3-");
        expect(result.length).toEqual(1);
        expect(result[0].bookId).toEqual(1);
        expect(result[0].chapter).toEqual(2);
        expect(result[0].startVerse).toEqual(3);
        expect(result[0].endVerse).toEqual(3);
    });
});