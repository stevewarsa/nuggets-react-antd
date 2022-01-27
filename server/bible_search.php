<?php
//header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

ini_set ('memory_limit', '150M');
include_once('./Passage.php');
$inputJSON = file_get_contents('php://input');
$input= json_decode( $inputJSON, TRUE );
$translations = $input['translations'];
$testament = $input['testament'];
$book = $input['book'];
$txt = $input['searchPhrase'];
$user = $input['user'];
error_log("Here is the search string sent in: ");
error_log($txt);
$selectSql = "select chapter, verse, b.book_name, b._id from verse v, book b where b._id = v.book_id ";
if ($testament == 'both') {
    // no restriction on books...
    error_log("no restriction on books...");
} else if ($testament == 'new') {
    // filter on new testament
    error_log("filter on new testament...");
    $selectSql .= "and v.book_id >= 40 ";
} else if ($testament == 'old') {
    // filter on old testament
    error_log("filter on old testament...");
    $selectSql .= "and v.book_id <= 39 ";
} else if ($testament == 'gospels') {
    // filter on old testament
    error_log("filter on the Gospels...");
    $selectSql .= "and v.book_id >= 40 and v.book_id <= 43 ";
} else if ($testament == 'pauls_letters') {
    // filter on the Apostle Paul's Letters
    error_log("filter on the Apostle Paul's Letters...");
    $selectSql .= "and v.book_id >= 45 and v.book_id <= 57 ";
} else if ($testament == 'non_pauline_letters') {
    // filter on the non-Pauline Epistles
    error_log("filter on the non-Pauline Epistles...");
    $selectSql .= "and v.book_id >= 58 and v.book_id <= 65 ";
}
if ($book != null && $book != "All") {
    $selectSql .= "and b.book_name = '" . $book . "' ";
}
$modSearchString = strtoupper($txt);
error_log($modSearchString);
$modSearchString = str_replace('*', '%', $modSearchString);
error_log($modSearchString);

if (!(strpos($modSearchString, "%") === 0)) {
    $modSearchString = "%" . $modSearchString;
}
error_log($modSearchString);

if (!((strpos($modSearchString, "%") + 1) === strlen($modSearchString))) {
    $modSearchString = $modSearchString . "%";
}
error_log($modSearchString);
//$modSearchString = sqlite_escape_string($modSearchString);
$selectSql .= " and upper(verse_text) like :searchString order by b._id, chapter, verse";
error_log($selectSql);
//error_log($modSearchString);

$arrayName = array();
foreach ($translations as $translation) {
	error_log('Opening translation database: ' . $translation . '...');
	$db = new SQLite3('db/' . $translation . '.db');
	$statement = $db->prepare($selectSql);
	$statement->bindValue(':searchString', $modSearchString);
	$results = $statement->execute();
	$resultsForTranslation = array();
	while ($row = $results->fetchArray()) {
		$passage = new Passage();
		$passage->passageId = -1;
		$passage->bookId = $row["_id"];
		$passage->bookName = $row["book_name"];
		$passage->chapter = $row["chapter"];
		$passage->startVerse = $row["verse"];
		$passage->endVerse = $row["verse"];
		$passage->translationId = $translation;
		$passage->translationName = $translation;
		array_push($resultsForTranslation, $passage);
	}
	$statement->close();
	foreach ($resultsForTranslation as $psg) {
		//error_log("book_id=" . $psg->bookId);
		//error_log("book_name=" . $psg->bookName);
		//error_log("chapter=" . $psg->chapter);
		//error_log("startVerse=" . $psg->startVerse);
		$verse = new Verse();
		$verse->passageId = -1;
		$versePartSql = 'select verse, verse_part_id, verse_text, is_words_of_christ, book_name from verse, book where book_id = _id and book_id = ' . $psg->bookId . ' and chapter = ' . $psg->chapter . ' and verse = ' . $psg->startVerse . ' order by verse, verse_part_id';
		$results = $db->query($versePartSql);
		//error_log("Here is the versePartSql: ");
		//error_log($versePartSql);
		while ($row = $results->fetchArray()) {
			$currentVerse = $row["verse"];
			$versePart = new VersePart();
			$versePart->verseNumber = $currentVerse;
			$versePart->versePartId = $row["verse_part_id"];
			$versePart->verseText = $row["verse_text"];
			if ($row["is_words_of_christ"] == "Y") {
				$versePart->wordsOfChrist = TRUE;
			} else {
				$versePart->wordsOfChrist = FALSE;
			}
			//error_log("Adding verse text to verse " . $currentVerse . ":");
			//error_log($versePart->verseText);
			$verse->addVersePart($versePart);
		}
		$psg->addVerse($verse);
	}
	$db->close();
	$db = null;
	$arrayName = array_merge($arrayName, $resultsForTranslation);
}


// now update the preferred translation to the translation being used on this request
if (sizeof($translations) == 1) {
	$db = new SQLite3('db/memory_' . $user . '.db');
	$statement = $db->prepare('update preferences set value = :selectedTranslation where key = :key');
	$statement->bindValue(':key', 'preferred_translation');
	$statement->bindValue(':selectedTranslation', $translations[0]);
	$statement->execute();
	$statement->close();

	if ($db->changes() < 1) {
		error_log("There were no updates made so inserting new preference for preferred_translation with value " . $translation);
		// there was no matching preference, so insert it
		$statement = $db->prepare('insert into preferences (key,value) values (:key, :value)');
		$statement->bindValue(':key', 'preferred_translation');
		$statement->bindValue(':value', $translation);
		$statement->execute();
		$statement->close();
	}
	$db->close();
}
header('Content-Type: application/json; charset=utf8');
$responseToSend = json_encode($arrayName);
error_log("Sending back JSON:");
error_log($responseToSend);
print_r($responseToSend);

?>