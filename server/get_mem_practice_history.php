<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */


//header('Access-Control-Allow-Origin: *');
$user = $_GET['user'];
error_log("Opening database db/memory_" . $user . ".db");
$db = new SQLite3('db/memory_' . $user . '.db');

$results = $db->query("select passage_id, date_viewed_str, date_viewed_long from history where history_record_type = 'MEM_PRACTICE' order by date_viewed_long DESC");

$arrayName = array();
while ($row = $results->fetchArray()) {
    $historyRec = new stdClass;
    $historyRec->passageId = $row['passage_id'];
    $historyRec->dateViewedStr = $row['date_viewed_str'];
    $historyRec->dateViewedLong = $row['date_viewed_long'];
    array_push($arrayName, $historyRec);
}
$db->close();
$responseJson = json_encode($arrayName);
print_r($responseJson);
?>