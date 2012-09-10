<?PHP
    // get configuration as array
    $string = file_get_contents("js/config.json");
    $json = json_decode($string,true);


    // create url for either GetFeatureInfo or GetCapabilities (default)
    $url = $json["wmsurl"];
    if ($_GET["type"] == "GetFeatureInfo") {
            $url .= $_GET["args"];
            header ("Content-Type:text/html");
    }
    else {
            $url .= "?service=wms&version=1.1.1&request=GetCapabilities";
            if (strlen($json["wmsnamespace"]) > 0) $url .= "&namespace=" . $json["wmsnamespace"];
            header ("Content-Type:text/xml");
    }

    // Fling results back to user
    echo file_get_contents($url);
?>
