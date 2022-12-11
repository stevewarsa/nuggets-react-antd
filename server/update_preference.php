<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlDialectInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header('Content-Type: application/json; charset=utf8');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$prefNm = $input->prefNm;
$prefVal = $input->prefVal;
$db = new SQLite3('db/memory_' . $user . '.db');
try {
    $statement = $db->prepare('update preferences set value = :prefVal where key = :prefKey');
    $statement->bindValue(':prefKey', $prefNm);
    $statement->bindValue(':prefVal', $prefVal);
    $statement->execute();
    $statement->close();

    if ($db->changes() < 1) {
        error_log("There were no updates made so inserting new preference for " . $prefNm . " with value " . $prefVal);
        // there was no matching preference, so insert it
        $statement = $db->prepare('insert into preferences (key,value) values (:key, :value)');
        $statement->bindValue(':key', $prefNm);
        $statement->bindValue(':value', $prefVal);
        $statement->execute();
        $statement->close();
    }
    $db->close();
    print_r(json_encode("success"));
} catch (Exception $e) {
    $db->close();
    error_log("An error occurred while updating the preference: " . $e->getMessage());
    print_r(json_encode("error"));
}
