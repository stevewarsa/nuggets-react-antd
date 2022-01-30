<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */


//header('Access-Control-Allow-Origin: *');
$user = $_GET['user'];
$passageId = $_GET['passageId'];
$lastViewedNum = $_GET['lastViewedNum'];
$lastViewedStr = urldecode($_GET['lastViewedStr']);

// update this passage 
$db = new SQLite3('db/memory_' . $user . '.db', SQLITE3_OPEN_READWRITE);
$statement = $db->prepare('update memory_passage set last_viewed_str = :last_viewed_str, last_viewed_num = :last_viewed_num where passage_id = :passage_id');
$statement->bindValue(':last_viewed_str', $lastViewedStr);
$statement->bindValue(':last_viewed_num', $lastViewedNum);
$statement->bindValue(':passage_id', $passageId);
$statement->execute();
$statement->close();

$db->close();

header('Content-Type: application/json; charset=utf8');

print_r(json_encode("success"));

?>