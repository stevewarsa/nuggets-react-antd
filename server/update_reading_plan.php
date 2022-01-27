<?php
header('Content-Type: application/json; charset=utf8');

if (!array_key_exists("user", $_GET) || !array_key_exists("dayOfWeek", $_GET) || !array_key_exists("book", $_GET) || !array_key_exists("bookId", $_GET) || !array_key_exists("chapter", $_GET)) {
    error_log("input variables don't exist - may be options call - exiting");
    exit();
}
$user = $_GET['user'];
$dayOfWeek = $_GET['dayOfWeek'];
$book = $_GET['book'];
$bookId = $_GET['bookId'];
$chapter = $_GET['chapter'];


// Insert a new book/chapter read record 
$db = new SQLite3('db/memory_' . $user . '.db', SQLITE3_OPEN_READWRITE);
$statement = $db->prepare('insert into reading_plan_progress(day_of_week,book_name,book_id,chapter) values(:day_of_week,:book_name,:book_id,:chapter)');
$statement->bindValue(':day_of_week', $dayOfWeek);
$statement->bindValue(':book_name', $book);
$statement->bindValue(':book_id', $bookId);
$statement->bindValue(':chapter', $chapter);
$statement->execute();
$statement->close();

$db->close();

print_r(json_encode("success"));

?>