import {doFuzzySearch} from "./pages/BrowseQuotes";
import {Quote} from "./model/quote";

describe("Searching Test Suite", () => {
    beforeEach(() => {
        // TODO: if needed
    });

    it("Straight match", () => {
        let result = doFuzzySearch("steve", [{quoteTx: "Hi, I am Steve"} as Quote]);
        expect(result.length).toEqual(1);
    });
    it("Match with non contiguous words", () => {
        let result = doFuzzySearch("steven warsa", [{quoteTx: "Hi, I am Steven Donald Warsa"} as Quote]);
        expect(result.length).toEqual(1);
    });
    it("Match with non contiguous partial words", () => {
        let result = doFuzzySearch("steve warsa", [{quoteTx: "Hi, I am Steven Donald Warsa"} as Quote]);
        expect(result.length).toEqual(1);
    });
});