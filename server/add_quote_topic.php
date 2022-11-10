<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$topics = $input->topics;
$quoteId = $input->quoteId;
error_log("Received data: user=" . $user . ", topicIds=" . json_encode($topics). ", quoteId=" . $quoteId);
$response = new stdClass;
$response->quoteId = $quoteId;
if (empty($topics) || $quoteId <= 0) {
    if (empty($topics)) {
        error_log("Topics array was empty, returning...");
    } else {
        error_log("Quote id is " . $quoteId . ", returning...");
    }
    $response->topics = array();
    $response->message = "error";
    print_r(json_encode($response));
    return;
}
$db = new SQLite3('db/memory_' . $user . '.db');
if ($topics[0]->id == -1) {
    error_log("Inserting new tag/topic...");
    $topic = $topics[0];
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
    if ($topic->id > 0) {
        $response->topics = array($topic);
        $response->message = "success";
    } else {
        $response->topics = array();
        $response->message = "error";
    }
    $db->close();
    print_r(json_encode($response));
} else {
    error_log("Inserting quote/topic mappings...");
    foreach ($topics as $topic) {
        $statement = $db->prepare("insert into quote_tag (tag_id, quote_id) values(:tagId, :quoteId)");
        $statement->bindValue(':tagId', $topic->id);
        $statement->bindValue(':quoteId', $quoteId);
        $statement->execute();
        $statement->close();
        $statement = null;
    }

    $response->message = "success";
    $response->topics = $topics;
    error_log("Quote/topic mappings inserted. sending back success");
    error_log("Quote/topic mapping closing database connection");
    $db->close();
    error_log("Quote/topic mapping - database connection closed");
    print_r(json_encode($response));
}
