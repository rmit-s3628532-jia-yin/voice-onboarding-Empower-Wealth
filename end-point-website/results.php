<?php
	session_start();

	$json = $_REQUEST["json"];

	$orderfile = fopen("results.txt", "w");

	fwrite($orderfile, $json);

	fclose($orderfile);


?>