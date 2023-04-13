export class Constants {
    public static ACTION_GO_TO: string[] = ["GO_TO", "Go to Quote"];
    public static ACTION_SEND_QUOTE: string[] = ["SEND_QUOTE", "Send Quote"];
    public static ACTION_COPY: string[] = ["COPY", "Copy Quote to Clipboard"];
    public static GUEST_USER: string = 'Guest';

    public static days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    public static booksByDay = {
        "Sunday": ["romans", "1-corinthians", "2-corinthians", "galatians", "ephesians", "philippians", "colossians", "1-thessalonians", "2-thessalonians", "1-timothy", "2-timothy", "titus", "philemon", "hebrews", "james", "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude"],
        "Monday": ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
        "Tuesday": ["joshua", "judges", "ruth", "1-samuel", "2-samuel", "1-kings", "2-kings", "1-chronicles", "2-chronicles", "ezra", "nehemiah", "esther"],
        "Wednesday": ["psalms"],
        "Thursday": ["job", "proverbs", "ecclesiastes", "song-of-solomon"],
        "Friday": ["isaiah", "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi", "revelation"],
        "Saturday": ["matthew", "mark", "luke", "john", "acts"]
    };

    public static translations: any[] = [
        { code: 'asv', translationName: 'ASV - American Standard Version' },
        { code: 'bbe', translationName: 'BBE - Bible in Basic English' },
        { code: 'csb', translationName: 'HCSB - Holman Christian Standard Bible' },
        { code: 'esv', translationName: 'ESV - English Standard Version' },
        { code: 'kjv', translationName: 'KJV - King James Version' },
        { code: 'nas', translationName: 'NASB - New American Standard Bible' },
        { code: 'net', translationName: 'NET - New English Translation' },
        { code: 'niv', translationName: 'NIV - New International Version (1984)' },
        { code: 'nkj', translationName: 'NKJV - New King James Version' },
        { code: 'nlt', translationName: 'NLT - New Living Translation' },
        { code: 'nrs', translationName: 'NRSB - New Revised Standard Bible' },
        { code: 'wbt', translationName: 'WB - The Webster Bible' },
        { code: 'ylt', translationName: 'YLT - Young\'s Literal Translation' }
    ];
    public static translationsShortNms: any[] = [
        { code: 'asv', translationName: 'ASV' },
        { code: 'bbe', translationName: 'BBE' },
        { code: 'csb', translationName: 'HCSB' },
        { code: 'esv', translationName: 'ESV' },
        { code: 'kjv', translationName: 'KJV' },
        { code: 'nas', translationName: 'NASB' },
        { code: 'net', translationName: 'NET' },
        { code: 'niv', translationName: 'NIV84' },
        { code: 'nkj', translationName: 'NKJV' },
        { code: 'nlt', translationName: 'NLT' },
        { code: 'nrs', translationName: 'NRSB' },
        { code: 'wbt', translationName: 'WB' },
        { code: 'ylt', translationName: 'YLT' }
    ];

    public static bookAbbrev = {
        "genesis": ["Gen", "Genesis"],
        "exodus": ["Ex", "Exodus"],
        "leviticus": ["Lev", "Leviticus"],
        "numbers": ["Nu", "Numbers"],
        "deuteronomy": ["Dt", "Deuteronomy"],
        "joshua": ["Josh", "Joshua"],
        "judges": ["Jud", "Judges"],
        "ruth": ["Ru", "Ruth"],
        "1-samuel": ["1 Sa", "1 Samuel"],
        "2-samuel": ["2 Sa", "2 Samuel"],
        "1-kings": ["1 Ki", "1 Kings"],
        "2-kings": ["2 Ki", "2 Kings"],
        "1-chronicles": ["1 Chr", "1 Chronicles"],
        "2-chronicles": ["2 Chr", "2 Chronicles"],
        "ezra": ["Ez", "Ezra"],
        "nehemiah": ["Neh", "Nehemiah"],
        "esther": ["Est", "Esther"],
        "job": ["Job", "Job"],
        "psalms": ["Ps.", "Psalms"],
        "proverbs": ["Prv", "Proverbs"],
        "ecclesiastes": ["Ecc", "Ecclesiastes"],
        "song-of-solomon": ["Song of Sol", "Song of Solomon"],
        "isaiah": ["Is", "Isaiah"],
        "jeremiah": ["Jer", "Jeremiah"],
        "lamentations": ["Lam", "Lamentations"],
        "ezekiel": ["Ez.", "Ezekiel"],
        "daniel": ["Dan.", "Daniel"],
        "hosea": ["Hos.", "Hosea"],
        "joel": ["Joel", "Joel"],
        "amos": ["Amos", "Amos"],
        "obadiah": ["Ob", "Obadiah"],
        "jonah": ["Jon", "Jonah"],
        "micah": ["Mic", "Micah"],
        "nahum": ["Nah", "Nahum"],
        "habakkuk": ["Hab", "Habakkuk"],
        "zephaniah": ["Zep", "Zephaniah"],
        "haggai": ["Hag.", "Haggai"],
        "zechariah": ["Zec", "Zechariah"],
        "malachi": ["Mal.", "Malachi"],
        "matthew": ["Mat", "Matthew"],
        "mark": ["Mk", "Mark"],
        "luke": ["Lk", "Luke"],
        "john": ["Jn", "John"],
        "acts": ["Ac", "Acts"],
        "romans": ["Rom.", "Romans"],
        "1-corinthians": ["1 Co", "1 Corinthians"],
        "2-corinthians": ["2 Co", "2 Corinthians"],
        "galatians": ["Gal", "Galatians"],
        "ephesians": ["Eph", "Ephesians"],
        "philippians": ["Phil", "Philippians"],
        "colossians": ["Col", "Colossians"],
        "1-thessalonians": ["1 Th", "1 Thessalonians"],
        "2-thessalonians": ["2 Th", "2 Thessalonians"],
        "1-timothy": ["1 Tim", "1 Timothy"],
        "2-timothy": ["2 Tim", "2 Timothy"],
        "titus": ["Tts", "Titus"],
        "philemon": ["Phlm", "Philemon"],
        "hebrews": ["Heb.", "Hebrews"],
        "james": ["Jas", "James"],
        "1-peter": ["1 Pt", "1 Peter"],
        "2-peter": ["2 Pt", "2 Peter"],
        "1-john": ["1 Jn", "1 John"],
        "2-john": ["2 Jn", "2 John"],
        "3-john": ["3 Jn", "3 John"],
        "jude": ["Jd", "Jude"],
        "revelation": ["Rev", "Revelation"]
    };
    public static booksByNum = {
        1: "genesis",
        2: "exodus",
        3: "leviticus",
        4: "numbers",
        5: "deuteronomy",
        6: "joshua",
        7: "judges",
        8: "ruth",
        9: "1-samuel",
        10: "2-samuel",
        11: "1-kings",
        12: "2-kings",
        13: "1-chronicles",
        14: "2-chronicles",
        15: "ezra",
        16: "nehemiah",
        17: "esther",
        18: "job",
        19: "psalms",
        20: "proverbs",
        21: "ecclesiastes",
        22: "song-of-solomon",
        23: "isaiah",
        24: "jeremiah",
        25: "lamentations",
        26: "ezekiel",
        27: "daniel",
        28: "hosea",
        29: "joel",
        30: "amos",
        31: "obadiah",
        32: "jonah",
        33: "micah",
        34: "nahum",
        35: "habakkuk",
        36: "zephaniah",
        37: "haggai",
        38: "zechariah",
        39: "malachi",
        40: "matthew",
        41: "mark",
        42: "luke",
        43: "john",
        44: "acts",
        45: "romans",
        46: "1-corinthians",
        47: "2-corinthians",
        48: "galatians",
        49: "ephesians",
        50: "philippians",
        51: "colossians",
        52: "1-thessalonians",
        53: "2-thessalonians",
        54: "1-timothy",
        55: "2-timothy",
        56: "titus",
        57: "philemon",
        58: "hebrews",
        59: "james",
        60: "1-peter",
        61: "2-peter",
        62: "1-john",
        63: "2-john",
        64: "3-john",
        65: "jude",
        66: "revelation"
    };

    public static translationLongNames = {
        asv: "ASV - American Standard Version",
        bbe: "BBE - Bible in Basic English",
        csb: "CSB - Holman Christian Standard Bible",
        esv: "ESV - English Standard Version",
        kjv: "KJV - King James Version",
        nas: "NASB - New American Standard Bible",
        net: "NET - New English Translation",
        niv: "NIV - New International Version (1984)",
        nkj: "NKJV - New King James Version",
        nlt: "NLT - New Living Translation",
        nrs: "NRSB - New Revised Standard Bible",
        wbt: "WB - The Webster Bible",
        ylt: "YLT - Young's Literal Translation"
    };


    public static translationMediumNames = {
        asv: "American Standard Version",
        bbe: "Bible in Basic English",
        csb: "Holman Christian Standard Bible",
        esv: "English Standard Version",
        kjv: "King James Version",
        nas: "New American Standard Bible",
        net: "New English Translation",
        niv: "New International Version",
        nkj: "New King James Version",
        nlt: "New Living Translation",
        nrs: "New Revised Standard Bible",
        wbt: "The Webster Bible",
        ylt: "Young's Literal Translation"
    };
}