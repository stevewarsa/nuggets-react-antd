<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header('Content-Type: application/json; charset=utf8');

include_once('./Objection.php');

$request = file_get_contents('php://input');
error_log("Here is the incoming request: ");
error_log($request);
$input = json_decode($request);

$user = $input->user;
$fromUser = $input->fromUser;
$emailTo = $input->emailTo;
$quote = $input->quote;
$comments = $input->comments;
$prompt = $quote->prompt;
$answer = $quote->answer;
$category = $quote->category;
$sourceId = $quote->objectionId;
error_log("Received data: user=" . $user . ", prompt=" . $prompt . ", answer=" . $answer . ", category=" . $category . ", fromUser=" . $fromUser . ", emailTo=" . $emailTo);
$objectionId = -1;

$db = new SQLite3('db/memory_' . $user . '.db');

// now insert this fact
$statement = $db->prepare("insert into common_objection (objection_text, objection_category, sent_from_user, approved, source_id) values (:objection_text,:objection_category, :sent_from_user, 'N', :source_id)");
$statement->bindValue(':objection_text', $prompt);
$statement->bindValue(':objection_category', $category);
$statement->bindValue(':sent_from_user', $fromUser);
$statement->bindValue(':source_id', $sourceId);
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
	$objection->approved = 'N';
	$objection->fromUser = $fromUser;
	
	error_log("Answer inserted, closing database and returning Objection object");

	$db->close();

	error_log('Emailing ' . $emailTo . ' regarding the quote...');
	// now email user to notify them that quote has been sent and requires approval
    $commentsToSend = $comments === "" ? "Here is a quote being sent to you by " . $fromUser : "Comments from " . $fromUser . ": " . $comments;
	$msg = "
		<html>
		<head>
		<title>Quote Sent to you from " . $fromUser . "</title>
		</head>
		<body>
		<p>Hello " . $user . ",</p>
		<p>" . $commentsToSend . ":</p><br>
		<p>" . $quote->answer . "</p><br>
		<p>Please click <a href='http://ps11911.com/bible-app/server/approve_quote.php?quote_id=" . $objectionId . "&user=" . $user . "'>this link</a> to add it to your quote list</p><br>
		<p>Thanks,</p>
		<p>The Bible Nuggets App</p>
		</body>
		</html>
	";
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
	// send email
	mail($emailTo, "Quote sent to you from " . $fromUser, $msg, $headers);
	error_log("The quote has been emailed.");

	// now update the email preference in the from user's database
	$db = new SQLite3('db/memory_' . $fromUser . '.db');
	$statement = $db->prepare('update preferences set value = :lastSendQuoteEmail where key = :key');
	$statement->bindValue(':key', 'last_send_quote_email');
	$statement->bindValue(':lastSendQuoteEmail', $emailTo);
	$statement->execute();
	$statement->close();

	if ($db->changes() < 1) {
		error_log("There were no updates made so inserting new preference for lastSendQuoteEmail with value " . $emailTo);
		// there was no matching preference, so insert it
		$statement = $db->prepare('insert into preferences (key,value) values (:key, :value)');
		$statement->bindValue(':key', 'last_send_quote_email');
		$statement->bindValue(':value', $emailTo);
		$statement->execute();
		$statement->close();
	}
	$db->close();

	$db = new SQLite3('db/memory_' . $fromUser . '.db');
	$statement = $db->prepare('update email_mapping set email_addr_tx = :email_addr_tx where user_nm = :user_nm');
	$statement->bindValue(':user_nm', $user);
	$statement->bindValue(':email_addr_tx', $emailTo);
	$statement->execute();
	$statement->close();

	if ($db->changes() < 1) {
		$statement = $db->prepare('insert into email_mapping (user_nm, email_addr_tx) values (:user_nm,:email_addr_tx)');
		$statement->bindValue(':user_nm', $user);
		$statement->bindValue(':email_addr_tx', $emailTo);
		$statement->execute();
		$statement->close();
		error_log("Inserted email mapping...");
	}
	$db->close();

	header('Content-Type: application/json; charset=utf8');

	print_r(json_encode($objection));
} else {

	$db->close();

	header('Content-Type: application/json; charset=utf8');

	error_log("Quote not sent to user - returning error");
	print_r(json_encode("error"));
}

?>