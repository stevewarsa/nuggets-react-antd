<?php
header('Content-Type: application/json; charset=utf8');

function newest($a, $b) {
    return filemtime($b) - filemtime($a);
}

$userArray = array();
$files = glob('db/memory_*.db');
uasort($files, "newest");
foreach ($files as $file) {
	$fname = basename($file);
	if ($fname == 'memory_.db' || $fname == 'memory_template.db' || $fname == 'memory_template.db.old' || $fname == 'memory_template.db.bak') {
		continue;
	}
	$parts = explode("_", $fname);
	$userName = explode(".db", $parts[1]);
	$numLastMod = filemtime($file);
	$lastModified = date('F d Y, H:i:s',$numLastMod);
	$obj = new stdClass;
	$obj->fileName = $fname;
	$obj->userName = $userName[0];
	$obj->numLastMod = $numLastMod;
	$obj->lastModified = $lastModified;
	array_push($userArray, $obj);
}
print_r(json_encode($userArray));
?>
