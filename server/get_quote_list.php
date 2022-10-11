<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlDialectInspection */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');

$user = $_GET['user'];

$db = new SQLite3('db/memory_' . $user . '.db');

$results = $db->query("SELECT quote_id, quote_tx, approved, sent_from_user, source_id FROM quote");
$arrayName = array();
while ($row = $results->fetchArray()) {
    $quote = new stdClass;
    $quote->quoteId = $row['quote_id'];
    $quote->quoteTx = $row['quote_tx'];
    $quote->approved = $row['approved'];
    $quote->fromUser = $row['sent_from_user'];
    $quote->sourceId = $row['source_id'];
    array_push($arrayName, $quote);
}
$db->close();
print_r(json_encode($arrayName));
