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
error_log("[remove_quote_topic.php] Received data: user=" . $user . ", topicId=" . $topic->id . ", topicName=" . $topic-> name . ", quoteId=" . $quoteId);
$topicId = $topic->id;

// now insert this quote
$db = new SQLite3('db/memory_' . $user . '.db');

$response = new stdClass;
$response->quoteId = $quoteId;
if ($topicId != -1 && $quoteId > 0) {
    error_log("[remove_quote_topic.php] Removing quote/topic mapping...");
    $statement = $db->prepare("delete from quote_tag where tag_id = :tagId and quote_id = :quoteId");
    $statement->bindValue(':tagId', $topicId);
    $statement->bindValue(':quoteId', $quoteId);
    $statement->execute();
    $statement->close();

    $response->message = "success";
    $tpc = new stdClass;
    $tpc->id = $topicId;
    $tpc->name = $topic->name;
    $response->topic = $tpc;
    error_log("[remove_quote_topic.php] Quote/topic mapping removed. sending back success");
} else {
    error_log("[remove_quote_topic.php] Unable to remove Quote/topic mapping - topicId=" . $topicId . ", quoteId=" . $quoteId . ". sending back error");
    $response->message = "error";
    $response->topic = $topic;
}
error_log("[remove_quote_topic.php] Quote/topic mapping closing database connection");
$db->close();
error_log("[remove_quote_topic.php] Quote/topic mapping - database connection closed");

print_r(json_encode($response));
