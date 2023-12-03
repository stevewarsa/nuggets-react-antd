<?php

class Passage {
    public $passageId;
    public $bookId;
    public $bookName;
    public $translationId;
    public $translationName;
    public $chapter;
    public $startVerse;
    public $endVerse;
    public $verseText;
    public $explanation;
    public $frequencyDays = -1;
    public $last_viewed_str = "N/A";
    public $last_viewed_num = -1;
    public $passageRefAppendLetter = null;
    public $verses = array();
    public $topics = array();
    public function addVerse($verse) {
        array_push($this->verses, $verse);
    }
}

class Verse {
    public $passageId;
    public $verseParts = array();
    public function addVersePart($versePart) {
        array_push($this->verseParts, $versePart);
    }
}

class VersePart {
    public $verseNumber;
    public $versePartId;
    public $verseText;
    public $wordsOfChrist;
}
