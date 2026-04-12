<?php
add_filter('determine_current_user', function($user) {
    if (!empty($_SERVER['PHP_AUTH_USER'])) {
        global $wpdb;
        $key = $_SERVER['PHP_AUTH_USER'];
        $secret = $_SERVER['PHP_AUTH_PW'];
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT user_id, consumer_secret FROM " . $wpdb->prefix . "woocommerce_api_keys WHERE consumer_key = %s",
            wc_api_hash($key)
        ));
        if ($row && hash_equals($row->consumer_secret, $secret)) {
            return $row->user_id;
        }
    }
    return $user;
}, 20);
