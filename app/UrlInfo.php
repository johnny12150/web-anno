<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use League\Flysystem\Exception;

class UrlInfo extends Model {

    protected $table = 'url_infos';

    protected $fillable = ['url', 'title'];

    public static function getByUrl($url)
    {
        return self::where('url', $url)->first();
    }


    /**
     * update title
     * @param string $url
     * @param string $title
     */
    public static function updateTitle($url, $title)
    {
        $url_info = self::getByUrl($url);
        if( $url_info != null) {
            $url_info->title = $title;
            $url_info->save();
        } else {
            $url_info = self::create([
                'url' => $url,
                'title' => $title
            ]);
        }

        return $url_info;
    }


    /**
     * Get html content from a web site
     * @param $url
     * @return string|false
     */
    private static function file_get_contents_curl($url)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,0);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,0);
        curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');

        $data = curl_exec($ch);
        curl_close($ch);

        return $dccleata;
    }

    /**
     * Get title from a web site
     * @param $url
     * @return string|null
     */
    public static function getTitleFromInternet($url)
    {
        try {
            $url = str_replace('annotator.local:8000', 'annotator.local:5000', $url);
            $html = self::file_get_contents_curl($url);
            $title = preg_match('/<title[^>]*>(.*?)<\/title>/ims', $html, $matches) ? $matches[1] : null;
            return $title;
        } catch(Exception $e) {
            return null;
        }

    }
}
