<?php

return [

	/*
	|--------------------------------------------------------------------------
	| oAuth Config
	|--------------------------------------------------------------------------
	*/

	/**
	 * Storage
	 */
	'storage' => 'Session',

	/**
	 * Consumers
	 */
	'consumers' => [

		'Facebook' => [
			'client_id'     => '1433734590270301',
			'client_secret' => 'ec3bda02660f6eabdb9a0a7a1f67f98f',
			'scope'         => ['email'],
		],

	]

];