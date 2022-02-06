<?php
//header('Access-Control-Allow-Origin: *');
$user = $_GET['user'];
$db = new SQLite3('db/memory_' . $user . '.db');

$results = $db->query('select nugget_id, book_id, chapter, start_verse, end_verse from nugget');
header('Content-Type: application/json; charset=utf8');
$arrayName = array();
while ($row = $results->fetchArray()) {
  $obj = new stdClass;
  $obj->nuggetId = $row['nugget_id'];
  $obj->bookId = $row['book_id'];
  $obj->chapter = $row['chapter'];
  $obj->startVerse = $row['start_verse'];
  $obj->endVerse = $row['end_verse'];
  array_push($arrayName, $obj);
}
$db->close();
print_r(json_encode($arrayName));
?>
