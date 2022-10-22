<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$quote = $input->quote;
error_log("[update_quote.php] Received data: user=" . $user . ", quoteTx=" . $quote->quoteTx . ", sourceId=" . $quote->sourceId . ", quoteId=" . $quote->quoteId);

$db = new SQLite3('db/memory_' . $user . '.db');
try {
  // now insert this fact
  $statement = $db->prepare('update quote set quote_tx = :quote_text where quote_id = :quote_id');
  $statement->bindValue(':quote_text', $quote->quoteTx);
  $statement->bindValue(':quote_id', $quote->quoteId);
  $statement->execute();
  $statement->close();
  $db->close();
  print_r(json_encode("success"));
} catch (Exception $e) {
  $db->close();
  error_log("An error occurred while updating the quote: " . $e->getMessage());
  print_r(json_encode("error"));
}

