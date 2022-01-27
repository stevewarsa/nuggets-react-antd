<?php


//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf8');

$user = $_GET['user'];


error_log('User ' . $user . ' is logging into Nuggets...');
$loginMessage = "success";
$filename = 'db/memory_' . $user . '.db';
if (file_exists($filename)) {
    print_r(json_encode($loginMessage));
} else {
    error_log("The file " . $filename . " does not exist, copying template to create new database.");
    if (!copy('db/memory_template.db', 'db/memory_' . $user . '.db')) {
        error_log("failed to copy file...\n");
        print_r(json_encode("Error: unable to copy file..."));
        exit();
    } else {
        print_r(json_encode("success"));
    }
}

?>