<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);
error_log("get_email_mappings.php - Here is the JSON received: ");
error_log($request);

$user = $input->user;
error_log("get_email_mappings.php - Received data: user=" . $user);

$db = new SQLite3('db/memory_' . $user . '.db');
$results = $db->query("select user_nm, email_addr_tx from email_mapping order by upper(user_nm)");

$arrayName = array();
while ($row = $results->fetchArray()) {
    $mapping = new stdClass;
    $mapping->userName = $row['user_nm'];
    $mapping->emailAddress = $row['email_addr_tx'];
    array_push($arrayName, $mapping);
}
$db->close();
$responseJson = json_encode($arrayName);
print_r($responseJson);
?>