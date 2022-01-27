<?php

//header('Access-Control-Allow-Origin: *');
include_once('./Passage.php');

$user = $_GET['user'];

$db = new SQLite3('db/memory_' . $user . '.db');
$statement = $db->prepare('select * from passage_text_override');
$results = $statement->execute();
$psgArray = array();
while ($row = $results->fetchArray()) {
	$passage = new Passage();
	$passage->passageId = $row["passage_id"];
	$passage->passageRefAppendLetter = $row["passage_ref_append_letter"];
	$verse = new Verse();
	$passage->addVerse($verse);
    $versePart = new VersePart();
    $versePart->verseNumber = $row["verse_num"];
    $versePart->verseText = $row["override_text"];
    if ($row["words_of_christ"] == "Y") {
        $versePart->wordsOfChrist = TRUE;
    } else {
        $versePart->wordsOfChrist = FALSE;
    }
    $verse->addVersePart($versePart);
	array_push($psgArray, $passage);
}

$statement->close();
$db->close();
header('Content-Type: application/json; charset=utf8');
print_r(json_encode($psgArray));
?>