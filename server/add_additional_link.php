<?php /** @noinspection PhpParamsInspection */
/** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);
error_log("add_additional_link.php - Here is the JSON received: ");
error_log($request);

$user = $input->user;
$key = $input->key;
$label = $input->label;
$action = $input->action;
error_log("add_additional_link.php - Received data: user=" . $user . ", key=" . $key . ", label=" . $label . ", action=" . $action);

$db = new SQLite3('db/memory_' . $user . '.db');
$createTable = "CREATE TABLE IF NOT EXISTS additional_link (
                            key_tx TEXT PRIMARY KEY,
                            label TEXT,
                            action TEXT,
                            created_dt DATETIME DEFAULT CURRENT_TIMESTAMP
                        )";
try {
    $db->exec($createTable);
    $statement = $db->prepare("insert into additional_link (key_tx, label, action) values (:key,:label,:action)");
    $statement->bindValue(':key', $key);
    $statement->bindValue(':label', $label);
    $statement->bindValue(':action', $action);
    $statement->execute();
    $statement->close();
    error_log("Inserted new link...");
	$db->close();
	print_r(json_encode("success"));
} catch (Exception $e) {
	$db->close();
	print_r(json_encode("error"));
}
?>