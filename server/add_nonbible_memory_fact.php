<?php
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

include_once('./Objection.php');


$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$prompt = $input->prompt;
$answer = $input->answer;
$category = $input->category;
$sourceId = $input->sourceId;
$fromUser = $input->fromUser;
error_log("Received data: user=" . $user . ", prompt=" . $prompt . ", answer=" . $answer . ", category=" . $category . ", sourceId=" . $sourceId);
$objectionId = -1;

// now insert this fact
$db = new SQLite3('db/memory_' . $user . '.db');
if ($sourceId != null && $fromUser != null) {
	$statement = $db->prepare("insert into common_objection (objection_text, objection_category, sent_from_user, approved, source_id) values (:objection_text,:objection_category, :sent_from_user, 'Y', :source_id)");
	$statement->bindValue(':objection_text', $prompt);
	$statement->bindValue(':objection_category', $category);
	$statement->bindValue(':sent_from_user', $fromUser);
	$statement->bindValue(':source_id', $sourceId);
} else {
	$statement = $db->prepare('insert into common_objection (objection_text, objection_category) values (:objection_text,:objection_category)');
	$statement->bindValue(':objection_text', $prompt);
	$statement->bindValue(':objection_category', $category);
}
$statement->execute();
$statement->close();

error_log("Inserted prompt... now getting last objection id inserted");

// now get the newly generated passage_id
$results = $db->query('SELECT last_insert_rowid() as objection_id');
$passageId = -1;
while ($row = $results->fetchArray()) {
    $objectionId = $row["objection_id"];
    break;
}
if ($objectionId != -1) {

	error_log("Last objection id retrieved, inserting answer");

	$statement = $db->prepare('insert into common_objection_answer (objection_id, answer_id, answer_text) values (:objection_id, 1, :answer_text)');
	$statement->bindValue(':objection_id', $objectionId);
	$statement->bindValue(':answer_text', $answer);
	$statement->execute();
	$statement->close();

	$objection = new Objection();
	$objection->objectionId = $objectionId;
	$objection->prompt = $prompt;
	$objection->answer = $answer;
	$objection->category = $category;
	$objection->answerId = 1;

	error_log("Answer inserted, closing database and returning Objection object");

	$db->close();

	print_r(json_encode($objection));
} else {

	$db->close();

	error_log("Last Objection ID inserted not found - returning error");
	print_r(json_encode("error"));
}

?>