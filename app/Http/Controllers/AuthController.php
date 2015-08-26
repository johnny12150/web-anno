<?php namespace App\Http\Controllers;

use App\AuthTable;
use App\User;
use Illuminate\Support\Facades\Request;
use League\Flysystem\Exception;
use OAuth;
use OAuth\Common\Http\Exception\TokenResponseException;

/**
 * Created by PhpStorm.
 * User: flyx
 * Date: 4/14/15
 * Time: 9:10 PM
 */
class AuthController extends Controller
{

    function getLogin()
    {
        return view('auth.login', [
            'callback_uri' => Request::input('callback_uri')
        ]);
    }

    function getLogout()
    {
        //clear session
        User::logout();
        //back to login page
        return redirect('auth/login');
    }

    public function getFacebook()
    {

        $callback_uri = Request::input('callback_uri');
        // get data from request
        $code = Request::input('code');

        // get full url as facebook redirect url
        $redirect_url = Request::fullUrl();

        // get fb service
        $fb = \OAuth::consumer('Facebook', $redirect_url);

        // if code is provided get user data and sign in
        if ( ! is_null($code) || User::check()) {
            $user = User::user();

            if($user == null) {
                try {
                    // This was a callback request from facebook, get the token
                    $token = $fb->requestAccessToken($code);
                } catch(TokenResponseException $e) {
                    dd($e);
                    return redirect('auth/login');
                }
                // Send a request with it
                $fbuser = json_decode($fb->request('/me'), false);
                dd($fbuser);
                // user login
                $user = User::login($fbuser, $token->getAccessToken());
            }

            // check if it was external website called
            if($callback_uri != null) {

                // generate a auth token for this external site
                $auth = AuthTable::add($callback_uri, $user->id);

                //check callback query string exist
                $hasQuery = strstr($callback_uri, '?');

                //add token to query string
                $callback_uri .= '#user_id='. $user->id .'&anno_token='. $auth->auth_token;

                //back to this external site
                return redirect($callback_uri);
            } else {
                //back to home page
                return redirect('/');
            }
        } else {
            // get fb authorization
            $url = $fb->getAuthorizationUri();

            // return to facebook login url

            return redirect((string)$url);
        }
    }

}