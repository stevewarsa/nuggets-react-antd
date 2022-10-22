<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$topic = $input->topic;
$quoteId = $input->quoteId;
error_log("Received data: user=" . $user . ", topicId=" . $topic->id . ", topicName=" . $topic-> name . ", quoteId=" . $quoteId);
$topicId = $topic->id;

// now insert this quote
$db = new SQLite3('db/memory_' . $user . '.db');
if ($topicId == -1) {
    error_log("Inserting new tag/topic...");
	$statement = $db->prepare("insert into tag (tag_name) values (:tagName)");
	$statement->bindValue(':tagName', $topic->name);
    $statement->execute();
    $statement->close();
    // now get the newly generated tag_id
    error_log("Inserted tag/topic... now getting last tag id inserted");
    $results = $db->query('SELECT last_insert_rowid() as tag_id');
    while ($row = $results->fetchArray()) {
        $topicId = $row["tag_id"];
        $topic->id = $topicId;
        error_log("New tag id retrieved");
        break;
    }
}

$response = new stdClass;
$response->quoteId = $quoteId;
if ($topicId != -1 && $quoteId > 0) {
    error_log("Inserting quote/topic mapping...");
    $statement = $db->prepare("insert into quote_tag (tag_id, quote_id) values (:tagId, :quoteId)");
    $statement->bindValue(':tagId', $topicId);
    $statement->bindValue(':quoteId', $quoteId);
    $statement->execute();
    $statement->close();

    $response->message = "success";
    $tpc = new stdClass;
    $tpc->id = $topicId;
    $tpc->name = $topic->name;
    $response->topic = $tpc;
    error_log("Quote/topic mapping inserted. sending back success");
} else {
    error_log("Unable to insert Quote/topic mapping - topicId=" . $topicId . ", quoteId=" . $quoteId . ". sending back error");
    $response->message = "error";
    $response->topic = $topic;
}
error_log("Quote/topic mapping closing database connection");
$db->close();
error_log("Quote/topic mapping - database connection closed");

print_r(json_encode($response));
