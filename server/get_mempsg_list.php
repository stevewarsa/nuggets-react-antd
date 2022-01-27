<?php


//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');

include_once('./Book.php');
include_once('./Passage.php');
$db = new SQLite3('db/niv.db');
$results = $db->query('select _id, book_name, (select max(chapter) from verse where book_id = _id) as last_chapter from book');

$books = array();
while ($row = $results->fetchArray()) {
    $book = new Book();
    $book->bookId = $row['_id'];
    $book->bookName = $row['book_name'];
    $book->maxChapter = $row['last_chapter'];
    $books[$row['_id']] = $book;
}

$db->close();

$user = $_GET['user'];
$db = new SQLite3('db/memory_' . $user . '.db');
$queued = $_GET['queued'];
if (isset($queued)) {
	$results = $db->query("select p.passage_id, book_id, chapter, start_verse, end_verse, m.preferred_translation_cd, frequency_days, last_viewed_str, last_viewed_num from passage p, memory_passage m where m.passage_id = p.passage_id and queued = '" . $queued . "'");
} else {
	$results = $db->query("select p.passage_id, book_id, chapter, start_verse, end_verse, m.preferred_translation_cd, frequency_days, last_viewed_str, last_viewed_num from passage p, memory_passage m where m.passage_id = p.passage_id and queued = 'N'");
}

$psgArray = array();
while ($row = $results->fetchArray()) {
    $passage = new Passage();
    $passage->passageId = $row['passage_id'];
    $passage->bookId = $row['book_id'];
    $passage->bookName = $books[$row['book_id']]->bookName;
    $passage->chapter = $row['chapter'];
    $passage->startVerse = $row['start_verse'];
    $passage->endVerse = $row['end_verse'];
    $passage->translationName = $row['preferred_translation_cd'];
    $passage->frequencyDays = $row['frequency_days'];
    $passage->last_viewed_str = $row['last_viewed_str'];
    $passage->last_viewed_num = $row['last_viewed_num'];
    array_push($psgArray, $passage);
}

$db->close();

print_r(json_encode($psgArray));

?>

