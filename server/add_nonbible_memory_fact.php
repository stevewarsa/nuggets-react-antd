<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$prompt = $input->prompt;
$quoteTxt = $input->answer;
$sourceId = $input->sourceId;
$fromUser = $input->fromUser;
error_log("Received data: user=" . $user . ", prompt=" . $prompt . ", quote=" . $quoteTxt . ", sourceId=" . $sourceId);
$quoteId = -1;

// now insert this quote
$db = new SQLite3('db/memory_' . $user . '.db');
if ($sourceId != null && $fromUser != null) {
	$statement = $db->prepare("insert into quote (quote_tx, sent_from_user, approved, source_id) values (:quote_tx, :sent_from_user, 'Y', :source_id)");
	$statement->bindValue(':quote_tx', $quoteTxt);
	$statement->bindValue(':sent_from_user', $fromUser);
	$statement->bindValue(':source_id', $sourceId);
} else {
	$statement = $db->prepare("insert into quote (quote_tx, approved) values (:quote_tx, 'Y')");
	$statement->bindValue(':quote_tx', $quoteTxt);
}
$statement->execute();
$statement->close();

error_log("Inserted quote... now getting last quote id inserted");

// now get the newly generated passage_id
$results = $db->query('SELECT last_insert_rowid() as quote_id');
while ($row = $results->fetchArray()) {
    $quoteId = $row["quote_id"];
    break;
}
if ($quoteId != -1) {

	error_log("Last quote id retrieved");
	$quote = new stdClass;
	$quote->quoteId = $quoteId;
    $quote->quoteTx = $quoteTxt;
    $quote->approved = 'Y';
    $quote->fromUser = $fromUser;
    $quote->sourceId = $sourceId;

	error_log("Quote inserted, closing database and returning Quote object");

	$db->close();

	print_r(json_encode($quote));
} else {

	$db->close();

	error_log("Last Quote ID inserted not found - returning error");
	print_r(json_encode("error"));
}
