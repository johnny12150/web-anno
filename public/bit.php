<?php

function create(){
	$servername = "mariadb";
	$username = "root";
	$password = "annotation";
	try{
		$conn = new PDO("mysql:host=$servername;dbname=annotation_new;charset=utf8", $username, $password);
		// set the PDO error mode to exception
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		echo "Connected successfully"; 
	}	
	catch(PDOException $e){
		echo "Connection failed: " . $e->getMessage();
	}
	$url = 'http://dev.annotation.taieol.tw/cyber.json';
	$content=file_get_contents($url);
	$content = iconv("big5","UTF-8",$content);
	$json = json_decode($content, true );
	foreach($json['records'] as $key => $img){
		//$img_url = $img['url'];
		//$img_count = Target::count_annotation($img_url);
		$img['p_title'] = str_replace('"', '', $img['p_title']);
		$img['p_title'] = str_replace("'", '',$img['p_title']);
		$img['a_title'] = str_replace('"', '', $img['a_title']);
		$img['a_title'] = str_replace("'", '',$img['a_title']);
		$sql =  'INSERT INTO digital_test(d_index, p_id, p_title, a_title, uname, url) VALUES (null,"'.$img['p_id'].'","'.$img['p_title'].'","'.$img['a_title'].'","'.$img['uname'].'","'.$img['url'].'");';

		$conn->exec($sql);	
	}
}
function update(){
	
	$servername = "mariadb";
	$username = "root";
	$password = "annotation";
	try{
		$conn = new PDO("mysql:host=$servername;dbname=annotation_new;charset=utf8", $username, $password);
		// set the PDO error mode to exception
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		echo "Connected successfully"; 
	}	
	catch(PDOException $e){
		echo "Connection failed: " . $e->getMessage();
	}
	$url = 'http://dev.annotation.taieol.tw/cyber.json';
	$content=file_get_contents($url);
	$content = iconv("big5","UTF-8",$content);
	$json = json_decode($content, true );
	foreach($json['records'] as $key => $img){
		//$img_url = $img['url'];
		//$img_count = Target::count_annotation($img_url);
		$img['p_title'] = str_replace('"', '', $img['p_title']);
		$img['p_title'] = str_replace("'", '',$img['p_title']);
		$img['a_title'] = str_replace('"', '', $img['a_title']);
		$img['a_title'] = str_replace("'", '',$img['a_title']);
		$sql = 'INSERT INTO digital_test(d_index, p_id, p_title, a_title, uname, url) VALUES (null,"'.$img['p_id'].'","'.$img['p_title'].'","'.$img['a_title'].'","'.$img['uname'].'","'.$img['url'].'") 
		ON DUPLICATE KEY UPDATE ';
		$conn->exec($sql);
	
	}

	
}
?>