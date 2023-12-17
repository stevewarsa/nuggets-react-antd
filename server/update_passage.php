<?php
/** @noinspection PhpParamsInspection */
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

$request = file_get_contents('php://input');
$input = json_decode($request);

$user = $input->user;
$passageId = $input->passage->passageId;
$chapter = $input->passage->chapter;
$startVerse = $input->passage->startVerse;
$endVerse = $input->passage->endVerse;
$translation =  $input->passage->translationName;
$frequency = $input->passage->frequencyDays;
$newText = $input->newText;
$passageRefAppendLetter = $input->passageRefAppendLetter;
$explanation = $input->passage->explanation;

// update this passage
$db = new SQLite3('db/memory_' . $user . '.db');
// Adding this busy timeout per the 2nd answer in this post: https://stackoverflow.com/questions/57795998/catch-up-sqlite-error-database-is-locked
// What was happening, was that when I sent in a very large explanation, I would get the message that the database is locked
// when trying to do the insert.  I'm assuming the problem was that it was still trying to roll back the update or do
// some other cleanup... Either way, that error was being echo'd out to the caller and not being caught in the try/catch block
$db->busyTimeout(250);
if (isset($explanation)) {
    error_log("update_passage.php - explanation is set to " . $explanation . ".  First trying to update it...");
    try {
        /** @noinspection SqlResolve */
        $statement = $db->prepare('update passage_explanation set explanation = :explanation where passage_id = :passage_id');
        $statement->bindValue(':explanation', $explanation);
        $statement->bindValue(':passage_id', $passageId);
        $statement->execute();
    } catch (PDOException $pdoException) {
        // Handle PDOException, which is specific to database operations
        error_log("update_passage.php - An error occurred while updating the explanation - PDOException: " . $pdoException->getMessage());
    } catch (Exception $e) {
        error_log("update_passage.php - An error occurred while updating the explanation: " . $e->getMessage());
    } finally {
        if (isset($statement)) {
            $statement->close();
        }
    }
    // now see if any rows were updated
    if ($db->changes() < 1) {
        error_log("update_passage.php - explanation is set to " . $explanation . ". Didn't update, so now inserting...");
        try {
            /** @noinspection SqlResolve */
            $statement = $db->prepare('insert into passage_explanation (passage_id, explanation) values (:passage_id, :explanation)');
            $statement->bindValue(':passage_id', $passageId);
            $statement->bindValue(':explanation', $explanation);
            $statement->execute();
        } catch (PDOException $pdoException) {
            // Handle PDOException, which is specific to database operations
            error_log("update_passage.php - An error occurred while inserting the explanation - PDOException: " . $pdoException->getMessage());
        } catch (Exception $e) {
            error_log("update_passage.php - An error occurred while inserting the explanation: " . $e->getMessage());
        } finally {
            if (isset($statement)) {
                $statement->close();
            }
        }
    }
}
/** @noinspection SqlResolve */
$statement = $db->prepare('update passage set chapter = :chapter, start_verse = :start_verse, end_verse = :end_verse where passage_id = :passage_id');
$statement->bindValue(':chapter', $chapter);
$statement->bindValue(':start_verse', $startVerse);
$statement->bindValue(':end_verse', $endVerse);
$statement->bindValue(':passage_id', $passageId);
$statement->execute();
$statement->close();

/** @noinspection SqlResolve */
$statement = $db->prepare('update memory_passage set preferred_translation_cd = :preferred_translation_cd, frequency_days = :frequency_days where passage_id = :passage_id');
$statement->bindValue(':preferred_translation_cd', $translation);
$statement->bindValue(':frequency_days', $frequency);
$statement->bindValue(':passage_id', $passageId);
$statement->execute();
$statement->close();

if (isset($newText)) {
    // first try to update the record...
    /** @noinspection SqlResolve */
    $statement = $db->prepare('update passage_text_override set verse_num = :verse_num, override_text = :override_text, passage_ref_append_letter = :passage_ref_append_letter where passage_id = :passage_id');
    $statement->bindValue(':verse_num', $startVerse);
    $statement->bindValue(':override_text', $newText);
    $statement->bindValue(':passage_ref_append_letter', $passageRefAppendLetter);
    $statement->bindValue(':passage_id', $passageId);
    $statement->execute();
    $statement->close();
    // now see if any rows were updated
    if ($db->changes() < 1) {
        // no rows were updated, so do the insert...
        /** @noinspection SqlResolve */
        $statement = $db->prepare('insert into passage_text_override (passage_id,verse_num,override_text,passage_ref_append_letter) values (:passage_id, :verse_num, :override_text, :passage_ref_append_letter)');
        $statement->bindValue(':passage_id', $passageId);
        $statement->bindValue(':verse_num', $startVerse);
        $statement->bindValue(':override_text', $newText);
        $statement->bindValue(':passage_ref_append_letter', $passageRefAppendLetter);
        $statement->execute();
        $statement->close();
    }
}

$db->close();

header('Content-Type: application/json; charset=utf8');

print_r(json_encode("success"));
