<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$topic = $input->topic;
$passageId = $input->passageId;
error_log("[remove_passage_topic.php] Received data: user=" . $user . ", topicId=" . $topic->id . ", topicName=" . $topic-> name . ", passageId=" . $passageId);
$topicId = $topic->id;

$db = new SQLite3('db/memory_' . $user . '.db');

$response = new stdClass;
$response->passageId = $passageId;
if ($topicId != -1 && $passageId > 0) {
    error_log("[remove_passage_topic.php] Removing passage/topic mapping...");
    $statement = $db->prepare("delete from tag_nugget where tag_id = :tagId and nugget_id = :passageId");
    $statement->bindValue(':tagId', $topicId);
    $statement->bindValue(':passageId', $passageId);
    $statement->execute();
    $statement->close();

    $response->message = "success";
    $tpc = new stdClass;
    $tpc->id = $topicId;
    $tpc->name = $topic->name;
    $response->topic = $tpc;
    error_log("[remove_passage_topic.php] passage/topic mapping removed. sending back success");
} else {
    error_log("[remove_passage_topic.php] Unable to remove passage/topic mapping - topicId=" . $topicId . ", quoteId=" . $passageId . ". sending back error");
    $response->message = "error";
    $response->topic = $topic;
}
error_log("[remove_passage_topic.php] passage/topic mapping closing database connection");
$db->close();
error_log("[remove_passage_topic.php] passage/topic mapping - database connection closed");

print_r(json_encode($response));
