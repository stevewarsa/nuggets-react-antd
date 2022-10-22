import {Quote} from "./model/quote";
import {QuoteMatch} from "./model/quote-match";
import {PassageUtils} from "./helpers/passage-utils";

export const doFuzzySearch = (searchCriteria: string, quotes: Quote[]): QuoteMatch[] => {
    const words = searchCriteria.split(" ").map(word => word.toUpperCase().trim());
    return quotes.map(qt => {
        let quoteMatch: QuoteMatch = {annotatedText: null, originalQuote: qt} as QuoteMatch;
        const quoteText = qt.quoteTx.toUpperCase();
        if (quoteText.includes(searchCriteria.toUpperCase().trim())) {
            quoteMatch.annotatedText = PassageUtils.updateAllMatches(searchCriteria, qt.quoteTx);
        } else {
            const quoteWords = quoteText.split(" ").map(word => word.trim());
            let foundWords: string[] = [];
            let allWordsMatch = true;
            for (let word of words) {
                let currWordFound = false;
                for (let quoteWord of quoteWords) {
                    // not exact match, but must include current word in a quote word (e.g. steve is included in steven)
                    if (quoteWord.includes(word)) {
                        currWordFound = true;
                        break;
                    }
                }
                if (!currWordFound) {
                    allWordsMatch = false;
                    break;
                } else {
                    foundWords.push(word);
                }
            }
            if (foundWords.length > 0 && allWordsMatch) {
                quoteMatch.annotatedText = qt.quoteTx;
                for (let foundWord of foundWords) {
                    quoteMatch.annotatedText = PassageUtils.updateAllMatches(foundWord, quoteMatch.annotatedText);
                }
            }
        }

        return quoteMatch;
    }).filter(qt => qt.annotatedText !== null);
}

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