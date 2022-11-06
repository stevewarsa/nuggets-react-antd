<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$topicIds = $input->topicIds;
$passageId = $input->passageId;
error_log("[add_passage_topic.php] Received data: user=" . $user . ", topicIds=" . json_encode($topicIds) . ", passageId=" . $passageId);

$db = new SQLite3('db/memory_' . $user . '.db');

$response = null;
if (count($topicIds) != 0 && $passageId > 0) {
    error_log("[add_passage_topic.php] Adding passage/topic mappings...");
    foreach ($topicIds as $topicId) {
        $statement = $db->prepare("insert into tag_nugget (tag_id, nugget_id) values(:tagId, :passageId)");
        $statement->bindValue(':tagId', $topicId);
        $statement->bindValue(':passageId', $passageId);
        $statement->execute();
        $statement->close();
        $statement = null;
    }

    $response = "success";
    error_log("[add_passage_topic.php] passage/topic mappings added. sending back success");
} else {
    error_log("[add_passage_topic.php] Unable to add passage/topic mappings - topicIds=" . json_encode($topicIds) . ", passageId=" . $passageId . ". sending back error");
    $response = "error";
}
error_log("[add_passage_topic.php] passage/topic mapping closing database connection");
$db->close();
error_log("[add_passage_topic.php] passage/topic mapping - database connection closed");

print_r(json_encode($response));
