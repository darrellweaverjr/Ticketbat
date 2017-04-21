<?php

//ADMIN ROUTES FOR APP GENERAL
Route::group(['prefix' => 'app','middleware' => 'app.security:0','namespace' => 'App'], function () {
    //apps config general
    Route::post('general_init', 'GeneralController@init');
    Route::post('general_show', 'GeneralController@show');
    Route::post('general_showtime', 'GeneralController@showtime');
    Route::post('general_contact', 'GeneralController@contact');
    //apps config session auth
    Route::post('auth_login', 'AuthController@login');
    //apps config manage shopping cart
    Route::post('cart_get', 'ShoppingCartController@get');
    Route::post('cart_add', 'ShoppingCartController@add');
    Route::post('cart_update', 'ShoppingCartController@update');
    Route::post('cart_remove', 'ShoppingCartController@remove');
    Route::post('cart_coupon', 'ShoppingCartController@coupon');
    //apps config purchase options
    Route::post('purchase_make', 'PurchaseController@buy');    
});
//ADMIN ROUTES FOR APP WITH LOGIN
Route::group(['prefix' => 'app','middleware' => 'app.security:1','namespace' => 'App'], function () {
    //apps config user options    
    Route::post('my_purchases', 'UserController@purchases');
    Route::post('my_venues_check', 'UserController@venues_to_check');
    Route::post('my_events_check', 'UserController@events_to_check');
    Route::post('my_purchases_check', 'UserController@purchases_to_check');
    Route::post('my_tickets_check', 'UserController@check_tickets');
    Route::post('my_tickets_scan', 'UserController@scan_tickets');
});
//ADMIN ROUTES FOR JSON FEED
Route::group(['prefix' => 'feed','middleware' => 'cors','namespace' => 'Feed'], function () {
    //feeds config
    Route::get('events/{venue_id}', 'FeedController@events');
});