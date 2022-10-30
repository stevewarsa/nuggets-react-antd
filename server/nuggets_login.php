<?php /** @noinspection SqlNoDataSourceInspection */
/** @noinspection SqlDialectInspection */
header("Content-Type: application/json; charset=utf8");

$user = $_GET["user"];

error_log("[nuggets_login.php] User " . $user . " is logging into Nuggets...");
$loginMessage = "success";
$filename = "db/memory_" . $user . ".db";
if (file_exists($filename)) {
    error_log("[nuggets_login.php] successfully logged in existing user " . $user . "! Returning 'success'.");
    print_r(json_encode($loginMessage));
} else {
    error_log("[nuggets_login.php] The file " . $filename . " does not exist, copying template to create new database.");
    if (!copy("db/memory_template.db", $filename)) {
        error_log("[nuggets_login.php] failed to copy file db/memory_template.db to " . $filename);
        print_r(json_encode("Error: unable to copy file db/memory_template.db to " . $filename));
    } else {
        error_log("[nuggets_login.php] successfully created db for user " . $user . "! Setting preferred translation to NIV");
        // now update the email preference in the from user's database
        $db = new SQLite3($filename);
        $statement = $db->prepare("update preferences set value = :translation where key = :key");
        $statement->bindValue(":key", "preferred_translation");
        $statement->bindValue(":translation", "niv");
        $statement->execute();
        $statement->close();

        if ($db->changes() < 1) {
            // there was no matching preference, so insert it
            $statement = $db->prepare("insert into preferences (key,value) values (:key, :value)");
            $statement->bindValue(":key", "preferred_translation");
            $statement->bindValue(":value", "niv");
            $statement->execute();
            $statement->close();
        }
        $db->close();
        print_r(json_encode($loginMessage));
    }
}

