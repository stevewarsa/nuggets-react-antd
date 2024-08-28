<?php /** @noinspection PhpParamsInspection */
/** @noinspection PhpParamsInspection */
/** @noinspection ALL */
/** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlDialectInspection */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');

$quoteId = $_GET['quoteId'];
$user = $_GET['user'];

$db = new SQLite3('db/memory_' . $user . '.db');
$quotesByQuoteId = array();
$results = $db->query("SELECT quote_tx FROM quote WHERE quote_id = " . $quoteId);
$quote = null;
while ($row = $results->fetchArray()) {
    $quote = $row['quote_tx'];
}
$db->close();
print_r(json_encode($quote));
