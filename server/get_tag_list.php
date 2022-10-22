<?php /** @noinspection SqlDialectInspection */
/** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlResolve */
header('Content-Type: application/json; charset=utf8');
include_once('./Tag.php');
include_once('./Passage.php');
$user = $_GET['user'];
$db = new SQLite3('db/memory_' . $user . '.db');

if (isset($_REQUEST['tagId'])) {
    $statement = $db->prepare("select p.nugget_id, p.book_id, chapter, start_verse, end_verse from tag t, tag_nugget tp, nugget p where t.tag_id = tp.tag_id and tp.nugget_id = p.nugget_id and t.tag_id = :tag_id order by book_id, chapter, start_verse");
    $statement->bindValue(':tag_id', $_REQUEST['tagId']);
    $results = $statement->execute();
    $arrayName = array();
    while ($row = $results->fetchArray()) {
        $passage = new Passage();
        $passage->passageId = $row['nugget_id'];
        $passage->bookId = $row['book_id'];
        $passage->chapter = $row['chapter'];
        $passage->startVerse = $row['start_verse'];
        $passage->endVerse = $row['end_verse'];
        $passage->bookName = $row['book_name'];
        array_push($arrayName, $passage);
    }
    $statement->close();
    $db->close();
    print_r(json_encode($arrayName));
} else {
    $results = $db->query('select tag_id, tag_name from tag order by LOWER(tag_name)');
    $arrayName = array();
    while ($row = $results->fetchArray()) {
        $tag = new Tag();
        $tag->id = $row['tag_id'];
        $tag->name = $row['tag_name'];
        array_push($arrayName, $tag);
    }
    print_r(json_encode($arrayName));
}


