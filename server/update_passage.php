<?php
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$passageId = $input->passage->passageId;
$chapter = $input->passage->chapter;
$startVerse = $input->passage->startVerse;
$endVerse = $input->passage->endVerse;
$translation =  $input->passage->translationName;
$frequency = $input->passage->frequencyDays;
$newText = $input->newText;
$passageRefAppendLetter = $input->passageRefAppendLetter;

// update this passage 
$db = new SQLite3('db/memory_' . $user . '.db');
$statement = $db->prepare('update passage set chapter = :chapter, start_verse = :start_verse, end_verse = :end_verse where passage_id = :passage_id');
$statement->bindValue(':chapter', $chapter);
$statement->bindValue(':start_verse', $startVerse);
$statement->bindValue(':end_verse', $endVerse);
$statement->bindValue(':passage_id', $passageId);
$statement->execute();
$statement->close();

$statement = $db->prepare('update memory_passage set preferred_translation_cd = :preferred_translation_cd, frequency_days = :frequency_days where passage_id = :passage_id');
$statement->bindValue(':preferred_translation_cd', $translation);
$statement->bindValue(':frequency_days', $frequency);
$statement->bindValue(':passage_id', $passageId);
$statement->execute();
$statement->close();

if (isset($newText)) {
	// first try to update the record...
	$statement = $db->prepare('update passage_text_override set verse_num = :verse_num, override_text = :override_text, passage_ref_append_letter = :passage_ref_append_letter where passage_id = :passage_id');
	$statement->bindValue(':verse_num', $startVerse);
	$statement->bindValue(':override_text', $newText);
	$statement->bindValue(':passage_ref_append_letter', $passageRefAppendLetter);
	$statement->bindValue(':passage_id', $passageId);
	$statement->execute();
	$statement->close();
	// now see if any rows were updated
	if ($db->changes() < 1) {
		// no rows were updated, so do the insert...
		$statement = $db->prepare('insert into passage_text_override (passage_id,verse_num,override_text,passage_ref_append_letter) values (:passage_id, :verse_num, :override_text, :passage_ref_append_letter)');
		$statement->bindValue(':passage_id', $passageId);
		$statement->bindValue(':verse_num', $startVerse);
		$statement->bindValue(':override_text', $newText);
		$statement->bindValue(':passage_ref_append_letter', $passageRefAppendLetter);
		$statement->execute();
		$statement->close();
	}
}

$db->close();


header('Content-Type: application/json; charset=utf8');

print_r(json_encode("success"));

?>