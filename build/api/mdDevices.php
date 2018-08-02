<?php
header('Content-Type: application/json');
$act = getHTTPValue('act','');
$dev_id = getHTTPValue('dev_id','');
$name = getHTTPValue('name','');
$apps = getHTTPValue('apps','');
$page = getHTTPValue('page','');
$count = getHTTPValue('count','');

callCgi($act, $dev_id, $name, $apps, $page, $count);

function callCgi($act, $dev_id, $name, $apps, $page, $count)
{
    $url = 'http://127.0.0.1:8080/cgi-bin/mediaDash/mdDevices.cgi';
	switch ($act) {
		case 'stop':
			$url = $url.'?act=stop&dev_id='.$dev_id;
			break;
		case 'rename':
			$url = $url.'?act=rename&dev_id='.$dev_id.'&name='.$name;
			break;
		case 'allow':
			/*if ($dev_id == '') {
				$url = $url.'?act=allow&apps='.$apps;
			} else {
				$url = $url.'?act=allowstop&dev_id='.$dev_id.'&apps='.$apps;
			}*/
			$url = $url.'?act=allow&dev_id='.$dev_id.'&apps='.$apps;
			break;
		case 'ping':
			$url = $url.'?act=ping';
			break;
		case 'listplay':
			/*if ($dev_id == '') {
				$url = $url.'?act=listplay&page='.$page.'&count='.$count;
			} else {
				$url = $url.'?act=listplay&dev_id='.$dev_id.'&page='.$page.'&count='.$count;
			}*/
			$url = $url.'?act=listplay&dev_id='.$dev_id.'&page='.$page.'&count='.$count;
			break;
	}
	$opts = array(
		'http' => array(
			'method' => 'GET'
		)
	);
	$context = stream_context_create($opts);
	//$res = file_get_contents($url, false, $context);
	$res = file_get_contents($url);

	echo $res;
}

function getHTTPValue($n, $default='', $dataType='string')
{
	if (isset($_POST[$n])) {
		return sanitizeInput($dataType, $_POST[$n], $default);
	}

	if (isset($_GET[$n])) {
		return sanitizeInput($dataType, $_GET[$n], $default);
	}

	//returns default value if not found
	return $default;
}

function sanitizeInput($dataType, $input, $default){
	if (is_array($input)) {
		foreach ($input as &$value) {
			if (false === sanitizeInputVar($dataType, $value)) {
				$value = $default;
			}
		}
		return $input;
	}else{
		if (sanitizeInputVar($dataType, $input)) {
			return $input;
		}else{
			return $default;
		}
	}
}

function sanitizeInputVar($dataType, &$input){
	switch ($dataType) {
		case 'number':
			if (!is_numeric($input)) {
				return false;
			} else {
				return true;
			}

		case 'text':
			$input = filter_var($input, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
			return true;

		case 'string':
		default:
			$input = filter_var($input, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW);
			if (preg_match('/^string\[([0-9]+)\]$/', $dataType, $matches)) {
				$input = substr($input, 0, $matches[1]);
			}
			return true;
	}

	return false;
}