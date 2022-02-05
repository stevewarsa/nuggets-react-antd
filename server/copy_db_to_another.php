<?php


//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');

$dbSource = $_GET['dbSource'];
$dbDest = $_GET['dbDest'];


error_log('DB Source is ' . $dbSource);
error_log('DB Dest is ' . $dbDest);

$sourceFilename = 'db/memory_' . $dbSource . '.db';
$destFilename = 'db/memory_' . $dbDest . '.db';

if (file_exists($destFilename)) {
    error_log("Backing up file " . $destFilename . " to backup file name: db/" . $dbDest . ".bak");
    if (!copy($destFilename, 'db/' . $dbDest . '.bak')) {
        error_log("failed to backup file...\n");
        print_r(json_encode("Error: unable to backup file..."));
        exit();
    }
}
error_log("Copying file " . $sourceFilename . " to file name: " . $destFilename . "...");
if (!copy($sourceFilename, $destFilename)) {
    error_log("failed to copy file...\n");
    print_r(json_encode("Error: unable to copy file..."));
    exit();
} else {
    print_r(json_encode("success"));
}

?>