<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
$input = json_decode($request);
error_log("add_email_mapping.php - Here is the JSON received: ");
error_log($request);

$user = $input->user;
$userToMapTo = $input->userToMapTo;
$emailAddrToMap = $input->emailAddrToMap;
error_log("add_email_mapping.php - Received data: user=" . $user . ", userToMapTo=" . $userToMapTo . ", emailAddrToMap=" . $emailAddrToMap);

// now insert this mapping
$db = new SQLite3('db/memory_' . $user . '.db');
try {
	$statement = $db->prepare('update email_mapping set email_addr_tx = :email_addr_tx where user_nm = :user_nm');
	$statement->bindValue(':user_nm', $userToMapTo);
	$statement->bindValue(':email_addr_tx', $emailAddrToMap);
	$statement->execute();
	$statement->close();

	if ($db->changes() < 1) {
		$statement = $db->prepare("insert into email_mapping (user_nm, email_addr_tx) values (:user_nm,:email_addr_tx)");
		$statement->bindValue(':user_nm', $userToMapTo);
		$statement->bindValue(':email_addr_tx', $emailAddrToMap);
		$statement->execute();
		$statement->close();
		error_log("Inserted email mapping...");
	} else {
		error_log("Updated email mapping...");
	}
	$db->close();
	print_r(json_encode("success"));
} catch (Exception $e) {
	$db->close();
	print_r(json_encode("error"));
}
?>