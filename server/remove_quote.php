<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$quoteId = $input->quoteId;
error_log("[remove_quote.php] Received data: user=" . $user . ", quoteId=" . $quoteId);

// now insert this quote
$db = new SQLite3('db/memory_' . $user . '.db');

$response = new stdClass;
$response->quoteId = $quoteId;
if ($quoteId > 0) {
    error_log("[remove_quote.php] Removing quote...");
    $statement = $db->prepare("delete from quote where quote_id = :quoteId");
    $statement->bindValue(':quoteId', $quoteId);
    $statement->execute();
    $statement->close();

    error_log("[remove_quote.php] Removing any quote/topic mappings for this quote...");
    $statement = $db->prepare("delete from quote_tag where quote_id = :quoteId");
    $statement->bindValue(':quoteId', $quoteId);
    $statement->execute();
    $statement->close();

    $response->message = "success";
    error_log("[remove_quote.php] Quote removed. sending back success");
} else {
    error_log("[remove_quote.php] Unable to remove Quote - quoteId=" . $quoteId . ". sending back error");
    $response->message = "error";
}
error_log("[remove_quote.php] closing database connection");
$db->close();
error_log("[remove_quote.php] database connection closed");

print_r(json_encode($response));
