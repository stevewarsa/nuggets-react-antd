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
error_log("Received data: user=" . $user . ", topic=" . json_encode($topic). ", passageId=" . $passageId);
$response = new stdClass;
$response->passageId = $passageId;
if (!$topic || $passageId <= 0) {
    if (!$topic) {
        error_log("Topic was empty, returning...");
    } else {
        error_log("Passage id is " . $passageId . ", returning...");
    }
    $response->topic = $topic;
    $response->message = "error";
    print_r(json_encode($response));
    return;
}
$db = new SQLite3('db/memory_' . $user . '.db');
error_log("Inserting new topic...");
$statement = $db->prepare("insert into tag (tag_name) values (:topicName)");
$statement->bindValue(':topicName', $topic->name);
$statement->execute();
$statement->close();
// now get the newly generated tag_id
error_log("Inserted tag/topic... now getting last tag id inserted");
$results = $db->query('SELECT last_insert_rowid() as topic_id');
while ($row = $results->fetchArray()) {
    $topicId = $row["topic_id"];
    $topic->id = $topicId;
    error_log("New topic id retrieved");
    break;
}
if ($topic->id > 0) {
    $statement = $db->prepare("insert into tag_nugget (tag_id, nugget_id) values(:tagId, :passageId)");
    $statement->bindValue(':tagId', $topic->id);
    $statement->bindValue(':passageId', $passageId);
    $statement->execute();
    $statement->close();

    $response->topic = $topic;
    $response->message = "success";
} else {
    $response->topic = $topic;
    $response->message = "error";
}
$db->close();
print_r(json_encode($response));
