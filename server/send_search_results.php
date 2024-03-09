<?php
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header('Content-Type: application/json; charset=utf8');

$request = file_get_contents('php://input');
error_log("Here is the incoming request: ");
error_log($request);
$input = json_decode($request);

$emailTo = $input->emailTo;
$searchResults = $input->searchResults;
// Search Param contains:
//	book
//	translation
//	testament
//	searchPhrase
//	user
$searchParam = $input->searchParam;

$book = $searchParam->book;
$translation = $searchParam->translation;
$testament = $searchParam->testament;
$searchPhrase = $searchParam->searchPhrase;
$fromUser = $searchParam->user;

error_log("Received data: fromUser=" . $fromUser . ", emailTo=" . $emailTo);

error_log('Emailing ' . $emailTo . ' with search results...');
$resultsTable = "
<table border='1'>
    <thead>
        <tr>
		    <th>Passage Ref</th>
			<th>Passage Text</th>
		</tr>
	</thead>
    <tbody>
					    	";
foreach ($searchResults as $thisResult) {
    // each result row is a string array with 2 values
    $row = "<tr><td>" . $thisResult[0] . "</td><td>" . $thisResult[1] . "</td></tr>";
    $resultsTable .= $row;
}
$resultsTable .= "</tbody></table>";
$bodyHeader = "<h3>Search Phrase: " . $searchPhrase . ", Scope: " . $testament . ", Book: " . $book . ", Translation: " . $translation . "</h3><h5>(" . sizeof($searchResults) . " results)</h5>";
// now email user with search results
$msg = "
	<html>
	<head>
	<title>Search Results from " . $fromUser . "</title>
	<style>
    .search_result {
      color: forestgreen;
      font-weight: bold;
    }
  </style>
	</head>
	<body>
	{{bodyHeader}}
	{{results}}
	</body>
	</html>
";
$msg = str_replace("{{results}}", $resultsTable, $msg);
$msg = str_replace("{{bodyHeader}}", $bodyHeader, $msg);
error_log("Sending the following html message: ");
error_log($msg);
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
// send email
$result = null;
try {
    mail($emailTo, "Search results from " . $fromUser, $msg, $headers);
    error_log("The search results have been emailed.");
    $result = "success";
} catch (Exception $e) {
    error_log("The search results have been emailed.");
    $result = "failure-" . $e->getMessage();
}

header('Content-Type: application/json; charset=utf8');

print_r(json_encode($result));

?>