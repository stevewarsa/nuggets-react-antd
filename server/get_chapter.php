<?php

//header('Access-Control-Allow-Origin: *');
include_once('./Passage.php');
function objectToArray($d) {
    if (is_object($d)) {
        // Gets the properties of the object
        $d = get_object_vars($d);
    }

    if (is_array($d)) {
        return array_map(__FUNCTION__, $d);
    } else {
        // Return array
        return $d;
    }
}

$bookId = $_GET["bookId"];
$chapter = $_GET["chapter"];
$startVerse = 1;
$translation = $_GET['translation'];
$db = new SQLite3('db/' . $translation . '.db');
$statement = $db->prepare('select max(verse) last_verse from verse where book_id = :book_id and chapter = :chapter');
$statement->bindValue(':book_id', $bookId);
$statement->bindValue(':chapter', $chapter);
$results = $statement->execute();
$row = $results->fetchArray();
$endVerse = $row["last_verse"];
$statement->close();

$statement = $db->prepare('select verse, verse_part_id, verse_text, is_words_of_christ, book_name from verse, book where book_id = _id and book_id = :book_id and chapter = :chapter and verse >= :start_verse and verse <= :end_verse order by verse, verse_part_id');
$statement->bindValue(':book_id', $bookId);
$statement->bindValue(':chapter', $chapter);
$statement->bindValue(':start_verse', $startVerse);
$statement->bindValue(':end_verse', $endVerse);
$results = $statement->execute();
$passage = new Passage();
$passage->passageId = -1;
$passage->bookId = intval($bookId);
$passage->chapter = intval($chapter);
$passage->startVerse = $startVerse;
$passage->endVerse = $endVerse;
$lastVerse = $startVerse;
$verse = new Verse();
$passage->addVerse($verse);
while ($row = $results->fetchArray()) {
    $currentVerse = $row["verse"];
    if ($currentVerse != $lastVerse) {
        $lastVerse = $currentVerse;
        $verse = new Verse();
        $passage->addVerse($verse);
    }
    $versePart = new VersePart();
    $versePart->verseNumber = $currentVerse;
    $versePart->versePartId = $row["verse_part_id"];
    $versePart->verseText = $row["verse_text"];
    if ($row["is_words_of_christ"] == "Y") {
        $versePart->wordsOfChrist = TRUE;
    } else {
        $versePart->wordsOfChrist = FALSE;
    }
    $verse->addVersePart($versePart);
    $passage->bookName = $row["book_name"];
}
$statement->close();
$db->close();
header('Content-Type: application/json; charset=utf8');
print_r(json_encode(objectToArray($passage)));

?>
