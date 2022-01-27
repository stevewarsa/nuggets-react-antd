<?php

//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');
$db = new SQLite3('db/niv.db');
$results = $db->query('SELECT b.book_name, max(chapter) as max_chapter FROM verse v, book b where b._id = v.book_id group by b.book_name order by b._id');

$arrayName = array();
while ($row = $results->fetchArray()) {
    $obj = new stdClass;
    $obj->bookName = $row['book_name'];
    $obj->maxChapter = $row['max_chapter'];
    array_push($arrayName, $obj);
}
$db->close();
$responseJson = json_encode($arrayName);
error_log('Returning response JSON ' . $responseJson);
print_r($responseJson);
?>