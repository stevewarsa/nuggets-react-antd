// @ts-ignore
import {doFuzzySearch} from "./pages/BrowseQuotes";
import {Quote} from "./model/quote";

describe("Test Suite", () => {
    beforeEach(() => {
        // TODO: Uncomment this if you're using `jest.spyOn()` to restore mocks between tests
        // jest.restoreAllMocks();
    });

    it("test searching", () => {
        const result = doFuzzySearch("steve", [{answer: "Hi, I am Steve"} as Quote]);
        expect(result.length).toEqual(1);
    });
});