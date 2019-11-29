<?php
session_start();

$orderfile = fopen("results.txt", "r");

$data = fgets($orderfile);

//call custom JSON formatting function
echo formatted_print($data);

//declare custom JSON formatting function
function formatted_print($unformatted_data) {

	//Initialize variable for adding space
	$indentation = 0;
	$flag = false;

	echo "<pre>"; //Format alignment

	//loop through JSON file
	for($counter = 0; $counter < strlen($unformatted_data); $counter++) {

		//Check for closing brackets - if found, reduce indentation
		if ( $unformatted_data[$counter] == '}' || $unformatted_data[$counter] == ']' ) {
			$indentation--;
			echo "\n";
			echo str_repeat(' ', ($indentation * 2));
		}

		//checks for double quotes and commas - if found, new line
		if ( $unformatted_data[$counter] == '"' && $counter > 1 && ($unformatted_data[$counter-1] == ',' || $unformatted_data[$counter-2] == ',') ) {
			echo "\n";
			echo str_repeat(' ', ($indentation * 2));
		}
 
		if ( $unformatted_data[$counter] == '"' && !$flag ) {
			if ( $counter > 1 && ($unformatted_data[$counter-1] == ':' || $unformatted_data[$counter-2] == ':' )) {
				echo '<span style="color:blue;font-weight:bold">'; //Add formatting for question and answer
			} else {
				echo '<span style="color:red;">'; //Add formatting for answer options
			}
		}

		echo $unformatted_data[$counter];
		//Checking conditions for adding closing span tag
		if ( $unformatted_data[$counter] == '"' && $flag ) {
			echo '</span>';
		}
		if ( $unformatted_data[$counter] == '"' ) {
			$flag = !$flag;
		}

		//Check for opening brackets - if found, increase indentation
		if ( $unformatted_data[$counter] == '{' || $unformatted_data[$counter] == '[' ) {
			$indentation++;
			echo "\n";
			echo str_repeat(' ', ($indentation * 2));
		}
	}
	echo "</pre>";
}

//Cite: https://linuxhint.com/pretty_json_php/
?>