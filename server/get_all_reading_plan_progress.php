<?php
header('Content-Type: application/json; charset=utf8');

$user = $_GET['user'];

$db = new SQLite3('db/memory_' . $user . '.db');
$results = $db->query("SELECT day_of_week, book_name, book_id, chapter, date_read FROM reading_plan_progress order by date_read DESC, chapter DESC");
$readingRecords = array();
while ($row = $results->fetchArray()) {
	$obj = new stdClass;
	$obj->bookId = $row['book_id'];
	$obj->bookName = $row['book_name'];
	$obj->chapter = $row['chapter'];
  $obj->dateRead = $row['date_read'];
  $obj->dayOfWeek = $row['day_of_week'];
  array_push($readingRecords, $obj);
}
$db->close();
print_r(json_encode($readingRecords));
?>
