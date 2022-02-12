<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$quote = $input->quote;
error_log("[update_quote.php] Received data: user=" . $user . ", prompt=" . $quote->prompt . ", answer=" . $quote->answer . ", category=" . $quote->category . ", sourceId=" . $quote->sourceId . ", objectionId=" . $quote->objectionId . ", answerId=" . $quote->answerId);

$db = new SQLite3('db/memory_' . $user . '.db');
try {
  // now insert this fact
  $statement = $db->prepare('update common_objection_answer set answer_text = :answer_text where objection_id = :objection_id and answer_id = :answer_id');
  $statement->bindValue(':answer_text', $quote->answer);
  $statement->bindValue(':objection_id', $quote->objectionId);
  $statement->bindValue(':answer_id', $quote->answerId);
  $statement->execute();
  $statement->close();
  $db->close();
  print_r(json_encode("success"));
} catch (Exception $e) {
  $db->close();
  error_log("An error occurred while updating the quote: " . $e->getMessage());
  print_r(json_encode("error"));
}
?>
