<?php

//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');
$user = $_GET['user'];
error_log("Opening database db/memory_" . $user . ".db");
$db = new SQLite3('db/memory_' . $user . '.db');

$results = $db->query("SELECT * FROM preferences where key != 'password'");

$arrayName = array();
while ($row = $results->fetchArray()) {
    $pref = new stdClass;
    $pref->key = $row['key'];
    $pref->value = $row['value'];
    array_push($arrayName, $pref);
}
$db->close();
$responseJson = json_encode($arrayName);
print_r($responseJson);
?>