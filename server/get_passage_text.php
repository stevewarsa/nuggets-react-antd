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



$user = $_GET['user'];

$db = new SQLite3('db/memory_' . $user . '.db');


$translation = $_GET['translation'];

$db = new SQLite3('db/' . $translation . '.db');

$book = $_GET['book'];

$chapter = (int)$_GET['chapter'];

$startVerse = (int)$_GET['start'];

$endVerse = (int)$_GET['end'];

$statement = $db->prepare('select verse, verse_part_id, verse_text, is_words_of_christ, book_id from verse v, book b where v.book_id = b._id and b.book_name = :book_name and chapter = :chapter and verse >= :start_verse and verse <= :end_verse order by verse, verse_part_id');

$statement->bindValue(':book_name', $book);

$statement->bindValue(':chapter', $chapter);

$statement->bindValue(':start_verse', $startVerse);

$statement->bindValue(':end_verse', $endVerse);

$results = $statement->execute();

$passage = new Passage();

$passage->passageId = -1;

$passage->chapter = $chapter;

$passage->startVerse = $startVerse;

$passage->endVerse = $endVerse;

$lastVerse = $startVerse;

$verse = new Verse();

$passage->addVerse($verse);

while ($row = $results->fetchArray()) {

    $passage->bookId = $row["book_id"];

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