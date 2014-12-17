<?php

/* Simple proxy to avoid cross origin problems */

// Security - if request is not from the same server decline

print_r($_SERVER);

header('Content-Type: application/json');

/* -- todo security only referer scripts on your page...
if (preg_match("/^" . $_SERVER['HTTP_HOST'] . "/", $_SERVER['REFERRER'])) {
    print "false"; // json response
    die();
}
 */

if (!isset($_GET['url'])) {
    print json_encode(['error' => true, 'message'=>'no url']);
    die();
}

$url = uri_decode($_GET['url']);



$results = file_get_contents($url);

print json_encode($results);


// Now in the client side - use:

/*

    var url = URIEncodeComponent( 'http://www.greatschools.com/something/county/san_francisco?format=json' );
    $.ajax({
        url: '/proxy.php?' + url,
        success: function(data) {
            console.log(data);
        },
        error: function(error) {
            console.log(error);
        }
    }); 
 
*/


?>
