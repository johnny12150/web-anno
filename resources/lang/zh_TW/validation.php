<?php

return [

	/*
	|--------------------------------------------------------------------------
	| Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| The following language lines contain the default error messages used by
	| the validator class. Some of these rules have multiple versions such
	| as the size rules. Feel free to tweak each of these messages here.
	|
	*/

	"accepted"             => "The :attribute must be accepted.",
	"active_url"           => "此欄位必須是合法的網址格式",
	"after"                => "此欄位日期必須在:date之後",
	"alpha"                => "此欄位必須是由英文、數字所組成",
	"alpha_dash"           => "此欄位必須是由英文、數字、- 所組成",
	"alpha_num"            => "此欄位必須只能是由數字所組成",
	"array"                => "此欄位必須是個陣列",
	"before"               => "此欄位日期必須在:date之前",
	"between"              => [
		"numeric" => "數值必須介於:min ~ :max",
		"file"    => "檔案大小必須介於:min ~ :max KB",
		"string"  => "字串長度必須介於 :min ~ :max 個字元",
		"array"   => "The :attribute must have between :min and :max items.",
	],
	"boolean"              => "The :attribute field must be true or false.",
	"confirmed"            => "The :attribute confirmation does not match.",
	"date"                 => "The :attribute is not a valid date.",
	"date_format"          => "The :attribute does not match the format :format.",
	"different"            => "The :attribute and :other must be different.",
	"digits"               => "The :attribute must be :digits digits.",
	"digits_between"       => "The :attribute must be between :min and :max digits.",
	"email"                => "此欄位必須是合法的email格式",
	"filled"               => "此欄位是必須填入的",
	"exists"               => "The selected :attribute is invalid.",
	"image"                => "The :attribute must be an image.",
	"in"                   => "The selected :attribute is invalid.",
	"integer"              => "The :attribute must be an integer.",
	"ip"                   => "The :attribute must be a valid IP address.",
	"max"                  => [
		"numeric" => ":attribute 不能超過 :max",
		"file"    => ":attribute 的檔案大小不能超過 :max KB",
		"string"  => ":attribute 不能超過 :max 個字元",
		"array"   => ":attribute 不能超過 :max 個元素",
	],
	"mimes"                => ":attribute 必須是以下檔案的格式: :values.",
	"min"                  => [
		"numeric" => "The :attribute must be at least :min.",
		"file"    => "The :attribute must be at least :min kilobytes.",
		"string"  => ":attribute 最少要有 :min 個字元",
		"array"   => "The :attribute must have at least :min items.",
	],
	"not_in"               => "欄位 :attribute 不合法.",
	"numeric"              => "欄位 :attribute 必須是數字.",
	"regex"                => "欄位 :attribute format is invalid.",
	"required"             => "此欄位是必須填入的",
	"required_if"          => "欄位 :attribute field is required when :other is :value.",
	"required_with"        => "欄位 :attribute field is required when :values is present.",
	"required_with_all"    => "欄位 :attribute field is required when :values is present.",
	"required_without"     => "欄位 :attribute field is required when :values is not present.",
	"required_without_all" => "欄位 :attribute field is required when none of :values are present.",
	"same"                 => "欄位 :attribute and :other must match.",
	"size"                 => [
		"numeric" => "The :attribute must be :size.",
		"file"    => "The :attribute must be :size kilobytes.",
		"string"  => "The :attribute must be :size characters.",
		"array"   => "The :attribute must contain :size items.",
	],
	"unique"               => ":attribute 已經存在",
	"url"                  => "The :attribute format is invalid.",
	"timezone"             => "The :attribute must be a valid zone.",

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| Here you may specify custom validation messages for attributes using the
	| convention "attribute.rule" to name the lines. This makes it quick to
	| specify a specific custom language line for a given attribute rule.
	|
	*/

	'custom' => [
		'attribute-name' => [
			'rule-name' => 'custom-message',
		],
	],

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Attributes
	|--------------------------------------------------------------------------
	|
	| The following language lines are used to swap attribute place-holders
	| with something more reader friendly such as E-Mail Address instead
	| of "email". This simply helps us make messages a little cleaner.
	|
	*/

	'attributes' => [],

];
