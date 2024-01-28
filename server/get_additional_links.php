<?php /** @noinspection PhpParamsInspection */
/** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$user = $_GET["user"];
error_log("get_additional_links.php - Received data: user=" . $user);

$db = new SQLite3('db/memory_' . $user . '.db');
$createTable = "CREATE TABLE IF NOT EXISTS additional_link (
                            key_tx TEXT PRIMARY KEY,
                            label TEXT,
                            action TEXT,
                            created_dt DATETIME DEFAULT CURRENT_TIMESTAMP
                        )";
$db->exec($createTable);
$results = $db->query("select key_tx, label, action from additional_link");

$linksArray = array();
while ($row = $results->fetchArray()) {
    $link = new stdClass;
    $link->key = $row['key_tx'];
    $link->label = $row['label'];
    $link->action = $row['action'];
    array_push($linksArray, $link);
}
$db->close();
$responseJson = json_encode($linksArray);
print_r($responseJson);
?>