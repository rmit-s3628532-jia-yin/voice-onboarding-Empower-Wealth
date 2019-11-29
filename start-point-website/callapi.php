<?php
    // Only run if all data is provided
    if(isset($_GET['phonenumber']) && isset($_GET['name']) && isset($_GET['ewid'])) {

        $phone = $_GET['phonenumber'];
        $name = $_GET['name'];
        $ewid = $_GET['ewid'];

        // Regex for 4 different ways of writing numbers (04-1234-5678, 4-1234-5678, 012345678, 12345678)
        if(preg_match("/^[0-9]{1}-[0-9]{4}-[0-9]{4}$/", $phone) || preg_match("/^[0-9]{9}$/", $phone) || preg_match("/^0[0-9]{1}-[0-9]{4}-[0-9]{4}$/", $phone) || preg_match("/^0[0-9]{9}$/", $phone)) {
            // Make sure phone number is correct length for Voximplant
            $phone = str_replace(["-", "–"], '', $phone);
            if(strlen($phone) == 10 && substr($phone, 0, 1) == 0) {
                $phone = substr($phone, 1);
            }
            // __ will be used to split our input to Voximplant into number, name and EWID
            $phone = str_replace("__","--",$phone);
            $name = str_replace("__","--",$name);
            $ewid = str_replace("__","--",$ewid);
            
            // Make API call
            $url = "https://api.voximplant.com/platform_api/StartScenarios/?account_id=3177334&api_key=7cd7d784-e990-4f0e-807c-1e119c1f72f9&rule_id=2785421&script_custom_data=61";
            $url = $url.$phone."__".$name."__".$ewid;
            $xml = file_get_contents($url);
        } else {
            echo "Error, invalid number";
        }
    } else {
        echo "Data missing";
    }
?>