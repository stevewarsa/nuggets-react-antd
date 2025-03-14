import {Passage} from "../model/passage";
import {Constants} from "../model/constants";
import copy from "copy-to-clipboard";
import {VerseNumAndText} from "../model/versenum-and-text";
import {StringUtils} from "./string.utils";

export class PassageUtils {
  public static readonly RAND: string = "rand";
  public static readonly BY_FREQ: string = "by_freq";
  public static readonly INTERLEAVE: string = "interleave";
  public static readonly BY_LAST_PRACTICED: string = "by_last_practiced_time";
  public static readonly BY_REF: string = "by_ref";
  public static readonly BY_PSG_TXT: string = "by_psgtxt";

  public static getPreferredTranslationFromPrefs(prefs: any[], defaultTranslation: string): string {
    return this.getPreferenceValueByKeyWithDefault(prefs, "preferred_translation", defaultTranslation);
  }

  public static getPreferenceValueByKeyWithDefault(prefs: any[], prefKey: string, defaultIfNotFound: string): string {
    if (prefs && prefs.length > 0) {
      for (let pref of prefs) {
        if (pref.key === prefKey && pref.value && pref.value.length > 0) {
          return pref.value as string;
        }
      }
    }
    return defaultIfNotFound;
  }

  public static getSurroundingVerses(passage: Passage, maxVerseByBookChapter: any[]): Passage {
    let maxVerse: number = this.getMaxVerseByBookAndChapter(
      passage.bookName, passage.chapter, -1, maxVerseByBookChapter);
    let newStartVerse: number = passage.startVerse - 4;
    let newEndVerse: number = passage.endVerse + 4;
    if (newStartVerse < 1) {
      newStartVerse = 1;
    }
    if (maxVerse !== -1 && newEndVerse > maxVerse) {
      newEndVerse = maxVerse;
    }
    let returnPassage: Passage = JSON.parse(JSON.stringify(passage));
    returnPassage.startVerse = newStartVerse;
    returnPassage.endVerse = newEndVerse;
    return returnPassage;
  }

  public static openInterlinearLink(passage: Passage) {
    let urlQuery: string;
    if (passage.startVerse === passage.endVerse) {
      urlQuery = passage.bookName + "+" + passage.chapter + ":" + passage.startVerse + "&t=nas"
    } else {
      urlQuery = passage.bookName + "+" + passage.chapter + ":" + passage.startVerse + "-" + passage.endVerse + "&t=nas"
    }
    window.open("https://www.biblestudytools.com/interlinear-bible/passage/?q=" + urlQuery, '_blank');
  }

  public static openBibleHubLink(passage: Passage) {
    // https://biblehub.com/genesis/1-1.htm
    const replacements: {} = {
      "1-kings": "1_kings",
      "2-kings": "2_kings",
      "1-samuel": "1_samuel",
      "2-samuel": "2_samuel",
      "1-chronicles": "1_chronicles",
      "2-chronicles": "2_chronicles",
      "1-peter": "1_peter",
      "2-peter": "2_peter",
      "1-john": "1_john",
      "2-john": "2_john",
      "3-john": "3_john",
      "song-of-solomon": "songs",
      "1-timothy": "1_timothy",
      "2-timothy": "2_timothy",
      "1-thessalonians": "1_thessalonians",
      "2-thessalonians": "2_thessalonians",
      "1-corinthians": "1_corinthians",
      "2-corinthians": "2_corinthians",
    };
    const bibleHubBookName: string = replacements.hasOwnProperty(passage.bookName) ? replacements[passage.bookName] : passage.bookName;
    let urlQuery: string = bibleHubBookName + "/" + passage.chapter + "-" + passage.startVerse + ".htm";
    window.open("https://biblehub.com/" + urlQuery, '_blank');
  }

  // public static deepClonePassage(passage: Passage): Passage {
  //   return JSON.parse(JSON.stringify(passage));
  // }

  public static removeDups(list: any[], uniqueField: string): any[] {
    // Declare a new array
    let newArray = [];
    // Declare an empty object
    let uniqueObject = {};
    // Loop for the array elements
    for (let i in list) {
      // Extract the val
      let uniqueFieldVal = list[i][uniqueField];
      // Use the val as the index
      uniqueObject[uniqueFieldVal] = list[i];
    }
    // Loop to push unique object into array
    for (let i in uniqueObject) {
      newArray.push(uniqueObject[i]);
    }
    return newArray;
  }

  public static copyPassageToClipboard(passage: Passage, noTransl: boolean): string {
    let clipboardContent = PassageUtils.getPassageForClipboard(passage, noTransl);
    copy(clipboardContent);
    return PassageUtils.getPassageString(passage, -1, 0, null, false, false, null);
  }

  public static getMaxVerseByBookAndChapter(bibleBookKey: string, chapter: number, defaultVal: number, maxVerseByBookChapter: any[]): number {
    let bibleBookKeys: string[] = Object.keys(maxVerseByBookChapter);
    for (let lBibleBookKey of bibleBookKeys) {
      if (lBibleBookKey === bibleBookKey) {
        let chaptersAndMaxVerse: string[] = maxVerseByBookChapter[lBibleBookKey];
        for (let chapterAndMaxVerse of chaptersAndMaxVerse) {
          let chap = chapterAndMaxVerse[0];
          let maxVerse = chapterAndMaxVerse[1];
          if (parseInt(chap) === chapter) {
            return parseInt(maxVerse);
          }
        }
      }
    }
    return defaultVal;
  }

  public static getNextIndex(currentIndex: number, numberOfPassages: number, next: boolean): number {
    let newIndex: number;
    if (next) {
      if (currentIndex === (numberOfPassages - 1)) {
        newIndex = 0;
      } else {
        newIndex = currentIndex + 1;
      }
    } else {
      if (currentIndex === 0) {
        newIndex = numberOfPassages - 1;
      } else {
        newIndex = currentIndex - 1;
      }
    }
    return newIndex;
  }

  public static getBookId(bookKey: string): number {
    let keys: any[] = Object.keys(Constants.booksByNum);
    for (let key of keys) {
      const iKey = parseInt(key);
      let book: string = Constants.booksByNum[iKey];
      if (bookKey === book) {
        return iKey;
      }
    }
    return -1;
  }

  public static getUnformattedPassageTextNoVerseNumbers(passage: Passage): string {
    let verseLen = passage.verses.length;
    let verseText = "";
    for (let i = 0; i < verseLen; i++) {
      let versePartLen = passage.verses[i].verseParts.length;
      for (let j = 0; j < versePartLen; j++) {
        verseText += passage.verses[i].verseParts[j].verseText + " ";
      }
    }
    return verseText;
  }

  public static getFormattedPassageText(passage: Passage, showVerseNumbers: boolean): string {
    let verseLen: number = passage.verses.length;
    let verseText: string = "";
    for (let i = 0; i < verseLen; i++) {
      let versePartLen: number = passage.verses[i].verseParts.length;
      for (let j = 0; j < versePartLen; j++) {
        if (j === 0 && showVerseNumbers) {
          verseText += "<span class='verse_num'><a style='color: black; cursor: default' id='" + passage.verses[i].verseParts[j].verseNumber + "'>"
            + passage.verses[i].verseParts[j].verseNumber
            + "</a></span> ";
        }
        if (passage.verses[i].verseParts[j].wordsOfChrist) {
          verseText += "<span class='wordsOfChrist'>";
          verseText += passage.verses[i].verseParts[j].verseText
            + " ";
          verseText += "</span>";
        } else {
          verseText += passage.verses[i].verseParts[j].verseText
            + " ";
        }
      }
    }
    // if (showVerseNumbers) {
    //   console.log("PassageUtils.getFormattedPassageText - here is the verse text: ", verseText);
    // }
    return verseText;
  }

  // public static getFormattedPassageTextHighlightMatches(passage: Passage, showVerseNumbers: boolean,
  //                                                       matches: {
  //                                                         nuggetId: number,
  //                                                         bookId: number,
  //                                                         chapter: number,
  //                                                         startVerse: number,
  //                                                         endVerse: number}[]): string {
  //   let verseLen: number = passage.verses.length;
  //   let verseText: string = "";
  //   for (let i = 0; i < verseLen; i++) {
  //     let versePartLen: number = passage.verses[i].verseParts.length;
  //     for (let j = 0; j < versePartLen; j++) {
  //       if (j === 0 && showVerseNumbers) {
  //         verseText += "<span class='verse_num'>"
  //           + passage.verses[i].verseParts[j].verseNumber
  //           + "</span> ";
  //       }
  //       let isMatch = false;
  //       for (let match of matches) {
  //         if (passage.verses[i].verseParts[j].verseNumber >= match.startVerse && passage.verses[i].verseParts[j].verseNumber <= match.endVerse) {
  //           isMatch = true;
  //           break;
  //         }
  //       }
  //       if (passage.verses[i].verseParts[j].wordsOfChrist) {
  //         if (isMatch) {
  //           verseText += "<span class='wordsOfChrist matchNugget'>";
  //           verseText += passage.verses[i].verseParts[j].verseText
  //             + " ";
  //           verseText += "</span>";
  //         } else {
  //           verseText += "<span class='wordsOfChrist'>";
  //           verseText += passage.verses[i].verseParts[j].verseText
  //             + " ";
  //           verseText += "</span>";
  //         }
  //       } else {
  //         if (isMatch) {
  //           verseText += "<span class='matchNugget'>";
  //           verseText += passage.verses[i].verseParts[j].verseText
  //             + " ";
  //           verseText += "</span>";
  //         } else {
  //           verseText += passage.verses[i].verseParts[j].verseText
  //             + " ";
  //         }
  //       }
  //     }
  //   }
  //   return verseText;
  // }

  public static getFormattedVersesAsArray(passage: Passage,
                                          matches: {
                                            nuggetId: number,
                                            bookId: number,
                                            chapter: number,
                                            startVerse: number,
                                            endVerse: number}[]): VerseNumAndText[] {
    let verses: VerseNumAndText[] = [];
    let verseLen: number = passage.verses.length;
    for (let i = 0; i < verseLen; i++) {
      let verseText: string = "";
      let plainVerseText: string = "";
      let versePartLen: number = passage.verses[i].verseParts.length;
      for (let j = 0; j < versePartLen; j++) {
        let isMatch = false;
        for (let match of matches) {
          if (passage.verses[i].verseParts[j].verseNumber >= match.startVerse && passage.verses[i].verseParts[j].verseNumber <= match.endVerse) {
            isMatch = true;
            break;
          }
        }
        if (passage.verses[i].verseParts[j].wordsOfChrist) {
          if (isMatch) {
            verseText += "<span class='wordsOfChrist matchNugget'>";
            verseText += passage.verses[i].verseParts[j].verseText + " ";
            plainVerseText += passage.verses[i].verseParts[j].verseText + " ";
            verseText += "</span>";
          } else {
            verseText += "<span class='wordsOfChrist'>";
            verseText += passage.verses[i].verseParts[j].verseText + " ";
            plainVerseText += passage.verses[i].verseParts[j].verseText + " ";
            verseText += "</span>";
          }
        } else {
          if (isMatch) {
            verseText += "<span class='matchNugget'>";
            verseText += passage.verses[i].verseParts[j].verseText + " ";
            plainVerseText += passage.verses[i].verseParts[j].verseText + " ";
            verseText += "</span>";
          } else {
            verseText += passage.verses[i].verseParts[j].verseText + " ";
            plainVerseText += passage.verses[i].verseParts[j].verseText + " ";
          }
        }
      }
      let currVerse = new VerseNumAndText();
      currVerse.verseText = verseText;
      currVerse.plainText = plainVerseText;
      currVerse.verseNum = passage.verses[i].verseParts[0].verseNumber;
      verses.push(currVerse);
    }
    return verses;
  }

  // public static getPassageForClipboardAsArray(passage: Passage): VerseNumAndText[] {
  //   if (!passage || !passage.verses || passage.verses.length === 0) {
  //     return [];
  //   }
  //   let passageArray: VerseNumAndText[] = [];
  //   let verseLen: number = passage.verses.length;
  //   for (let i = 0; i < verseLen; i++) {
  //     let verseText: string = "";
  //     let versePartLen: number = passage.verses[i].verseParts.length;
  //     for (let j = 0; j < versePartLen; j++) {
  //       verseText += passage.verses[i].verseParts[j].verseText
  //         + " ";
  //     }
  //     let verse: VerseNumAndText = new VerseNumAndText();
  //     verse.verseNum = passage.verses[i].verseParts[0].verseNumber;
  //     verse.verseText = verseText;
  //     passageArray.push(verse);
  //   }
  //   return passageArray;
  // }

  public static getPassageForClipboard(passage: Passage, noTransl: boolean): string {
    if (!passage || !passage.verses || passage.verses.length === 0) {
      return "";
    }
    let verseLen: number = passage.verses.length;
    let verseText: string = "";
    if (passage.passageRefAppendLetter && passage.passageRefAppendLetter.length > 0) {
      verseText += this.getPassageStringNoIndex(passage, true, noTransl, passage.passageRefAppendLetter);
    } else {
      verseText += this.getPassageStringNoIndex(passage, true, noTransl);
    }
    verseText += "\n\n";
    for (let i = 0; i < verseLen; i++) {
      let versePartLen: number = passage.verses[i].verseParts.length;
      for (let j = 0; j < versePartLen; j++) {
        verseText += passage.verses[i].verseParts[j].verseText
          + " ";
      }
    }
    return verseText;
  }

  public static getFormattedPassageTextHighlight(passage: Passage, textToHighlight: string, showVerseNumbers: boolean) {
    var formattedText = this.getFormattedPassageText(passage, showVerseNumbers);
    return this.updateAllMatches(textToHighlight, formattedText);
  }

  public static updateAllMatches(find: string, str: string) {
    if (StringUtils.isEmpty(find) || StringUtils.isEmpty(str)) {
      return str;
    }
    const findWords = find.split(" ");
    let locString = str;
    for (let findWord of findWords) {
      let stringToHighlight = findWord.replace("*", "(.*?)");
      //console.log("PassageUtils.updateAllMatches - Here is the regex wildcard: '" + stringToHighlight + "'");
      if (stringToHighlight === "") {
        continue;
      }
      let regex: RegExp = new RegExp(stringToHighlight, "ig");
      locString = locString.replace(regex, "<span class='search_result'>$&</span>");
    }
    return locString;
  }

  public static updateLineFeedsWithBr(stringToModify: string): string {
    let re = /\n/gi;
    stringToModify = stringToModify.replace(re, '<br/>');
    return stringToModify;
  }

  public static getPassageStringNoIndex(passage: Passage, translShort: boolean, noTransl: boolean, appendLetter?: string) {
    let verseNumbers: string;
    if (passage.startVerse === passage.endVerse) {
      verseNumbers = passage.startVerse + "";
    } else {
      verseNumbers = passage.startVerse + "-" + passage.endVerse;
    }

    if (appendLetter) {
      verseNumbers += appendLetter;
    }

    let regularBook: string;
    if (passage.bookName) {
      regularBook = this.getRegularBook(this.getBookId(passage.bookName));
    } else {
      regularBook = Constants.bookAbbrev[Constants.booksByNum[passage.bookId]][1];
    }
    if (passage.translationId || passage.translationName) {
      if (translShort) {
        const matchingTranslation = Constants.translationsShortNms.find(t => t.code === (passage.translationId ? passage.translationId : passage.translationName));
        return regularBook + " " + passage.chapter + ":" + verseNumbers + (noTransl ? "" : " (" + matchingTranslation.translationName + ")");
      } else {
        return regularBook + " " + passage.chapter + ":" + verseNumbers + (noTransl ? "" : " (" + Constants.translationMediumNames[(passage.translationId ? passage.translationId : passage.translationName)] + ")");
      }
    } else {
      return regularBook + " " + passage.chapter + ":" + verseNumbers;
    }
  }

  public static getPassageString(passage: Passage, currentIndex: number, passagesLen: number, transl: string, shortBook: boolean, showProgress: boolean, appendLetter?: string): string {
    let verseNumbers: string;
    if (passage.startVerse === passage.endVerse)
      verseNumbers = passage.startVerse + "";
    else
      verseNumbers =  passage.startVerse + "-" + passage.endVerse;

    if (appendLetter) {
      verseNumbers += appendLetter;
    }

    let bookName: string = shortBook ? this.getShortBook(passage.bookId) : this.getRegularBook(passage.bookId);
    let translString: string = "";
    if (transl) {
      translString = "<br/><span class='bible_version'>(" + transl + ")</span>";
    }
    if (showProgress) {
      return bookName + " " + passage.chapter + ":" + verseNumbers + translString + " - " + (currentIndex + 1) + " of " + passagesLen;
    } else {
      return bookName + " " + passage.chapter + ":" + verseNumbers + translString;
    }
  }

  static EXACT_BOOK_MATCH = 1;
  static PARTIAL_BOOK_MATCH = 2;
  static BOOK_MATCH_PLUS = 3;

  public static getPassageFromPassageRef(passageRef: string): Passage[] {
    passageRef = passageRef.trim().toLowerCase();
    const matchingPassages: Passage[] = [];
    for (let bookNm in Constants.bookAbbrev) {
      const fullBookNm: string = Constants.bookAbbrev[bookNm][1];

      // Exactly equal
      if (passageRef === fullBookNm.toLowerCase()) {
        matchingPassages.push(this.handleMatch(bookNm, PassageUtils.EXACT_BOOK_MATCH, passageRef, fullBookNm));
        continue;
      }
      // Passage reference contains one of the book names
      if (passageRef.startsWith(fullBookNm.toLowerCase())) {
        matchingPassages.push(this.handleMatch(bookNm, PassageUtils.BOOK_MATCH_PLUS, passageRef, fullBookNm));
        continue;
      }
      // the Passage reference passed in is a partial match to one of the book names
      if (fullBookNm.toLowerCase().includes(passageRef)) {
        matchingPassages.push(this.handleMatch(bookNm, PassageUtils.PARTIAL_BOOK_MATCH, passageRef, fullBookNm));
        continue;
      }
    }
    return matchingPassages;
  }

  private static handleMatch(bookNm: string, matchType: number, passageRef: string, fullBookNm: string): Passage {
    let passage = new Passage();
    passage.chapter = 1;
    passage.startVerse = 1;
    passage.endVerse = 1;
    passage.bookName = bookNm;
    passage.bookId = PassageUtils.getBookId(bookNm);
    if (matchType === PassageUtils.BOOK_MATCH_PLUS) {
      this.handleBookMatchPlus(passageRef, fullBookNm, passage);
    }
    return passage;
  }

  private static handleBookMatchPlus(passageRef: string, fullBookNm: string, passage: Passage) {
    // assume that what is after the book is a chapter and possibly more
    let chapter = passageRef.substring(fullBookNm.length + 1, passageRef.length);
    if (chapter.includes(":")) {
      // assume that they're trying to specify a verse or a verse range
      let chapterParts = chapter.split(":");
      if (!isNaN(Number(chapterParts[0]))) {
        // assume that what is after the book name is a chapter
        passage.chapter = parseInt(chapterParts[0]);
      }
      if (chapter.includes("-")) {
        // this is a verse range
        let verseRange = chapterParts[1].split("-");
        if (!isNaN(Number(verseRange[0]))) {
          passage.startVerse = parseInt(verseRange[0]);
        }
        if (!isNaN(Number(verseRange[1])) && verseRange[1] !== "") {
          passage.endVerse = parseInt(verseRange[1]);
        } else {
          passage.endVerse = passage.startVerse;
        }
      } else {
        // this is only 1 verse
        if (!isNaN(Number(chapterParts[1])) && chapterParts[1] !== "") {
          passage.startVerse = parseInt(chapterParts[1]);
          passage.endVerse = passage.startVerse;
        } else {
          passage.startVerse = 1;
          passage.endVerse = 1;
        }
      }
    } else {
      if (!isNaN(Number(chapter))) {
        // assume that what is after the book name is a chapter
        passage.chapter = parseInt(chapter);
      }
    }
  }

  public static getRegularBook(bookId: number) {
    let bookName = Constants.booksByNum[bookId];
    return Constants.bookAbbrev[bookName][1];
  }

  public static getShortBook(bookId: number) {
    let bookName = Constants.booksByNum[bookId];
    return Constants.bookAbbrev[bookName][0];
  }

  public static shuffleArray(arr: any[]) {
    for (let i: number = arr.length - 1; i >= 0; i--) {
      let randomIndex: number = Math.floor(Math.random() * (i + 1));
      let itemAtIndex: number = arr[randomIndex];
      arr[randomIndex] = arr[i];
      arr[i] = itemAtIndex;
    }
  }

  public static sortAccordingToPracticeConfig(order: string, arr: any[]): any[] {
    if (order === PassageUtils.RAND) {
      //console.log("displayOrder=rand");
      this.shuffleArray(arr);
    } else if (order === PassageUtils.BY_FREQ) {
      //console.log("displayOrder=by_freq");
      arr = arr.sort((a: Passage, b: Passage) => {
        return (a.frequencyDays - b.frequencyDays);
      });
    } else if (order === PassageUtils.BY_LAST_PRACTICED) {
      //console.log("displayOrder=by_last_practiced_time");
      arr = arr.sort((a: Passage, b: Passage) => {
        return (a.last_viewed_num - b.last_viewed_num);
      });
    }
    return arr;
  }

  // public static sortUserListByName(users: MemUser[]): MemUser[] {
  //   return users.sort((a: MemUser, b: MemUser) => {
  //     let nameA = a.userName.toUpperCase();
  //     let nameB = b.userName.toUpperCase();
  //     if (nameA < nameB) {
  //       return -1;
  //     }
  //     if (nameA > nameB) {
  //       return 1;
  //     }
  //     // names must be equal
  //     return 0;
  //   });
  // }

  public static sortWithinFrequencyGroups(passages: Passage[], order: string): Passage[] {
    let frequencyGroups: {[freq: number]: Passage[]} = this.getFrequencyGroups(passages);
    // now, iterate through the frequency groups and randomize each group
    // and append that group to the return array
    let returnPassageArray: Passage[] = [];
    let numFrequencies: number[] = Object.keys(frequencyGroups)
        .map(f => parseInt(f))
        .sort((a: number, b: number) => {
          return a - b;
        });
    for (let numFreq of numFrequencies) {
      let passagesForFrequency: Passage[] = frequencyGroups[numFreq + ""];
      if (order === PassageUtils.RAND) {
        // randomize this group...
        passagesForFrequency.sort(() => Math.random() - 0.5);
      } else if (order === PassageUtils.BY_LAST_PRACTICED) {
        passagesForFrequency.sort((a, b) => a.last_viewed_num - b.last_viewed_num);
      }
      // now append to the return array
      returnPassageArray = returnPassageArray.concat(passagesForFrequency);
    }
    return returnPassageArray;
  }

  public static getFrequencyGroups(passages: Passage[]): {[freq: number]: Passage[]} {
    let frequencyGroups: {[freq: number]: Passage[]} = {};
    for (let passage of passages) {
      let frequencyGroup: Passage[] = frequencyGroups[passage.frequencyDays];
      if (!frequencyGroup) {
        frequencyGroups[passage.frequencyDays] = [passage];
      } else {
        frequencyGroup.push(passage);
        frequencyGroups[passage.frequencyDays] = frequencyGroup;
      }
    }
    for (let i = 1; i <= 3; i++) {
      if (frequencyGroups["" + i] === undefined) {
        frequencyGroups["" + i] = [];
      }
    }
    return frequencyGroups;
  }
}
