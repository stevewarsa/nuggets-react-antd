<?php /** @noinspection PhpLoopNeverIteratesInspection */
/** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header('Content-Type: application/json; charset=utf8');

$request = file_get_contents('php://input');
error_log("Here is the incoming request: ");
error_log($request);
$input = json_decode($request);

$toUser = $input->user;
$fromUser = $input->fromUser;
$emailTo = $input->emailTo;
$quote = $input->quote;
$comments = $input->comments;
$quoteTx = $quote->quoteTx;
$sourceId = $quote->quoteId;
error_log("Received data: user=" . $toUser . ", quoteTx=" . $quoteTx . ", fromUser=" . $fromUser . ", emailTo=" . $emailTo . ", comments=" . $comments . ", sourceId=" . $sourceId);

$quoteId = -1;

$db = new SQLite3('db/memory_' . $toUser . '.db');

// now insert this quote
$statement = $db->prepare("insert into quote (quote_tx, sent_from_user, approved, source_id) values (:quote_tx,:sent_from_user, 'N', :source_id)");
$statement->bindValue(':quote_tx', $quoteTx);
$statement->bindValue(':sent_from_user', $fromUser);
$statement->bindValue(':source_id', $sourceId);
$statement->execute();
$statement->close();

error_log("Inserted quote... now getting last quote id inserted");

// now get the newly generated quote_id
$results = $db->query('SELECT last_insert_rowid() as quote_id');
$passageId = -1;
while ($row = $results->fetchArray()) {
    $quoteId = $row["quote_id"];
    break;
}
if ($quoteId != -1) {
	error_log("Last quote id retrieved");

	$newQuote = new stdClass;
	$newQuote->quoteId = $quoteId;
	$newQuote->quoteTx = $quoteTx;
	$newQuote->approved = 'N';
	$newQuote->fromUser = $fromUser;
    $newQuote->sourceId = $sourceId;
	
	error_log("Closing database and returning Quote object");

	$db->close();

	error_log('Emailing ' . $emailTo . ' regarding the quote...');
	// now email user to notify them that quote has been sent and requires approval
    $commentsToSend = $comments === "" ? "Here is a quote being sent to you by " . $fromUser : "Comments from " . $fromUser . ": " . $comments;
	$msg = "
	    <!DOCTYPE html>
		<html lang=\"en\">
		<head>
		<title>Quote Sent to you from " . $fromUser . "</title>
		</head>
		<body>
		<p>Hello " . $toUser . ",</p>
		<p>" . $commentsToSend . ":</p><br>
		<p>" . $newQuote->quoteTx . "</p><br>
		<p>Please click <a href='http://ps11911.com/bible-app/server/approve_quote.php?quote_id=" . $quoteId . "&user=" . $toUser . "'>this link</a> to add it to your quote list</p><br>
		<p>Thanks,</p>
		<p>The Bible App</p>
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

	$statement = $db->prepare('update email_mapping set email_addr_tx = :email_addr_tx where user_nm = :user_nm');
	$statement->bindValue(':user_nm', $toUser);
	$statement->bindValue(':email_addr_tx', $emailTo);
	$statement->execute();
	$statement->close();

	if ($db->changes() < 1) {
		$statement = $db->prepare('insert into email_mapping (user_nm, email_addr_tx) values (:user_nm,:email_addr_tx)');
		$statement->bindValue(':user_nm', $toUser);
		$statement->bindValue(':email_addr_tx', $emailTo);
		$statement->execute();
		$statement->close();
		error_log("Inserted email mapping...");
	}
	$db->close();

	header('Content-Type: application/json; charset=utf8');

	print_r(json_encode($newQuote));
} else {
	$db->close();
	header('Content-Type: application/json; charset=utf8');
	error_log("Quote not sent to user - returning error");
	print_r(json_encode("error"));
}
