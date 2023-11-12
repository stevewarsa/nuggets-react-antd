<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlDialectInspection */
//header('Access-Control-Allow-Origin: *');
$user = $_GET['user'];
$translation = $_GET['translation'];
$book = $_GET['book'];

// first get the book id based on the book name
$translDb = new SQLite3('db/' . $translation . '.db');
$translStmt = $translDb->prepare('select _id from book where book_name = :book_name');
$translStmt->bindValue(':book_name', $book);
$translResults = $translStmt->execute();
$bookId = -1;
while ($translRow = $translResults->fetchArray()) {
    $bookId = $translRow["_id"];
    break;
}
$translStmt->close();
$translDb->close();

$chapter = $_GET['chapter'];
$startVerse = $_GET['start'];
$endVerse = $_GET['end'];

// now insert this as a passage 
$db = new SQLite3('db/memory_' . $user . '.db');
$statement = $db->prepare('insert into passage (book_id, chapter, start_verse, end_verse) values(:book_id,:chapter,:start_verse,:end_verse)');
$statement->bindValue(':book_id', $bookId);
$statement->bindValue(':chapter', $chapter);
$statement->bindValue(':start_verse', $startVerse);
$statement->bindValue(':end_verse', $endVerse);
$statement->execute();
$statement->close();

// now get the newly generated passage_id
$results = $db->query('SELECT last_insert_rowid() as passage_id');
$passageId = -1;
while ($row = $results->fetchArray()) {
    $passageId = $row["passage_id"];
    break;
}
$queue = $_GET['queue'];

// finally insert this newly created passage into the memory passages
$statement = $db->prepare("insert into memory_passage (passage_id, queued, preferred_translation_cd, frequency_days) values(:passage_id,:queue,:translation,1)");

$statement->bindValue(':passage_id', $passageId);
$statement->bindValue(':translation', $translation);
$statement->bindValue(':queue', $queue);
$statement->execute();
$statement->close();


// now update the preferred translation to the translation being used on this request
$statement = $db->prepare('update preferences set value = :selectedTranslation where key = :key');
$statement->bindValue(':key', 'preferred_translation');
$statement->bindValue(':selectedTranslation', $translation);
$statement->execute();
$statement->close();

if ($db->changes() < 1) {
	error_log("There were no updates made so inserting new preference for preferred_translation with value " . $translation);
	// there was no matching preference, so insert it
	$statement = $db->prepare('insert into preferences (key,value) values (:key, :value)');
	$statement->bindValue(':key', 'preferred_translation');
	$statement->bindValue(':value', $translation);
	$statement->execute();
	$statement->close();
}

$db->close();

header('Content-Type: application/json; charset=utf8');

print_r(json_encode($passageId));

?>