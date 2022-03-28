<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */

//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');
$translation = $_GET['translation'];
$db = new SQLite3('db/' . $translation . '.db');
$results = $db->query('SELECT b.book_name, chapter, max(verse) as max_verse FROM book b, verse v where b._id = v.book_id and v.book_id = b._id group by b.book_name, chapter order by b._id, chapter');

$arrayName = array();
while ($row = $results->fetchArray()) {
    $bookName = $row['book_name'];
    $chapterVersePairs = null;
    if (array_key_exists($bookName, $arrayName)) {
        $chapterVersePairs = $arrayName[$bookName];
    } else {
        $chapterVersePairs = array();
    }
    array_push($chapterVersePairs, array($row['chapter'], $row['max_verse']));
    $arrayName[$bookName] = $chapterVersePairs;
}
$db->close();
$responseJson = json_encode($arrayName);
error_log('Returning response JSON ' . $responseJson);
print_r($responseJson);
?>