<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */

$user = $_GET['user'];
$quoteId = $_GET['quote_id'];

$db = new SQLite3('db/memory_' . $user . '.db');
$statement = $db->prepare("update common_objection set approved = 'Y' where objection_id = :quote_id");
$statement->bindValue(':quote_id', $quoteId);
$statement->execute();
$statement->close();

$db->close();
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Quote Approved</title>
	</head>
	<body>
		<h3>The quote <?=$quoteId?> is now approved by user <?=$user?>.  You can visit the site here:</h3>
		<!--suppress HtmlUnknownTarget -->
        <a href="/bible-app">Bible Nuggets Web Site</a>
	</body>
</html>
