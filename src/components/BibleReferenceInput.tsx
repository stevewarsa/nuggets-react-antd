import { useState, useEffect } from "react";
import {Constants} from "../model/constants";
import {Form, ListGroup} from "react-bootstrap";

interface Suggestion {
    text: string;
    type: 'book' | 'chapter' | 'verse';
}

interface BibleReferenceInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const BibleReferenceInput: React.FC<BibleReferenceInputProps> = ({ value, onChange }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        const getSuggestions = () => {
            if (!value.trim()) {
                setSuggestions([]);
                return;
            }

            let newSuggestions: Suggestion[] = [];

            const parts = value.trim().split(/[\s:]/);
            const lastPart = parts[parts.length - 1].toLowerCase();

            // Book suggestions
            if (parts.length === 1 && !value.includes(':')) {
                // Check if we have an exact book match
                const exactMatch = Object.entries(Constants.bookAbbrev).find(([key, [abbrev, fullName]]) =>
                    key === lastPart ||
                    abbrev.toLowerCase() === lastPart ||
                    fullName.toLowerCase() === lastPart
                );

                if (exactMatch) {
                    // If we have an exact match, show all chapters for this book
                    const bookInfo = Constants.maxChapterByBook.find(b => b.bookName === exactMatch[0]);
                    if (bookInfo) {
                        newSuggestions = Array.from(
                            { length: bookInfo.maxChapter },
                            (_, i) => ({
                                text: `${exactMatch[1][1]} ${i + 1}:`,
                                type: 'chapter' as const
                            })
                        );
                    }
                } else {
                    // If no exact match, show matching book suggestions
                    newSuggestions = Object.entries(Constants.bookAbbrev)
                        .filter(([key, [abbrev, fullName]]) => {
                            const searchTerm = lastPart.toLowerCase();
                            return (
                                key.toLowerCase().startsWith(searchTerm) ||
                                abbrev.toLowerCase().startsWith(searchTerm) ||
                                fullName.toLowerCase().startsWith(searchTerm)
                            );
                        })
                        .map(([key, [, fullName]]) => ({
                            text: fullName,
                            type: 'book' as const
                        }));
                }
            }

            // Handle book and chapter without colon
            else if (parts.length === 2 && !value.includes(':')) {
                const [bookPart, chapterPart] = parts;
                const bookMatch = Object.entries(Constants.bookAbbrev).find(
                    ([, [, fullName]]) => fullName.toLowerCase() === bookPart.toLowerCase()
                );

                if (bookMatch && /^\d*$/.test(chapterPart)) {
                    const bookInfo = Constants.maxChapterByBook.find(b => b.bookName === bookMatch[0]);
                    if (bookInfo) {
                        newSuggestions = Array.from(
                            { length: bookInfo.maxChapter },
                            (_, i) => i + 1
                        )
                            .filter(num => num.toString().startsWith(chapterPart))
                            .map(num => ({
                                text: `${bookMatch[1][1]} ${num}:`,
                                type: 'chapter' as const
                            }));
                    }
                }
            }

            // Chapter and verse suggestions
            else if (value.includes(':')) {
                const [bookChapter, verse] = value.split(':');
                const [book, chapter] = bookChapter.trim().split(/\s+/);

                if (book && chapter) {
                    const bookKey = Object.entries(Constants.bookAbbrev)
                        .find(([, [, fullName]]) => fullName.toLowerCase() === book.toLowerCase())?.[0];

                    if (bookKey) {
                        const chapterNum = parseInt(chapter);
                        const chapterVerses = Constants.maxVerseByBookAndChapter[bookKey as keyof typeof Constants.maxVerseByBookAndChapter];
                        const maxVerse = chapterVerses?.find(([chap]) => chap === chapterNum)?.[1] || 0;

                        newSuggestions = Array.from(
                            { length: maxVerse },
                            (_, i) => i + 1
                        )
                            .map(num => ({
                                text: `${book} ${chapter}:${num}`,
                                type: 'verse' as const
                            }))
                            // Filter verses based on user input after the colon
                            .filter(suggestion => {
                                if (!verse) return true;
                                const verseNum = suggestion.text.split(':')[1];
                                return verseNum.startsWith(verse);
                            });
                    }
                }
            }

            // If there's exactly one suggestion and it matches the input exactly,
            // clear the suggestions
            if (newSuggestions.length === 1 && newSuggestions[0].text === value) {
                setSuggestions([]);
            } else {
                setSuggestions(newSuggestions);
            }
        };

        getSuggestions();
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        onChange(suggestion.text);
    };

    return (
        <div className="position-relative">
            <Form.Control
                type="text"
                placeholder="Type a Bible reference (e.g., John 3:16)"
                value={value}
                onChange={handleInputChange}
                className="mb-2"
            />
            {suggestions.length > 0 && (
                <ListGroup className="position-absolute w-100 shadow-sm" style={{ zIndex: 1000 }}>
                    {suggestions.map((suggestion, index) => (
                        <ListGroup.Item
                            key={index}
                            action
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="cursor-pointer"
                        >
                            {suggestion.text}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};