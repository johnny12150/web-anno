<?php namespace App\Http\Controllers;

use App\AuthTable;
use App\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use League\Flysystem\Exception;
use OAuth;
use OAuth\Common\Http\Exception\TokenResponseException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\MessageBag;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

/**
 * Created by PhpStorm.
 * User: flyx
 * Date: 4/14/15
 * Time: 9:10 PM
 */
class AuthController extends Controller
{
    use AuthenticatesAndRegistersUsers;
    /*
        |--------------------------------------------------------------------------
        | Registration & Login Controller
        |--------------------------------------------------------------------------
        |
        | This controller handles the registration of new users, as well as the
        | authentication of existing users. By default, this controller uses
        | a simple trait to add these behaviors. Why don't you explore it?
        |
        */
    /**
     * Create a new authentication controller instance.
     *
     *
     */
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'getLogout']);
    }
    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|max:255|min:2',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|confirmed|min:6',
            'password_confirmation' => 'required|min:6'
            //'g-recaptcha-response' => 'required|recaptcha',
        ]);
    }

    function getLogin()
    {

        Auth::logout();

        $hasCallback = (Request::input('callback_url') != ''
            && Request::input('uri') != ''
            && Request::input('domain') != '');


        $registerCallbackUrl = url('auth/register?'.http_build_query([
                'callback_url' => Request::input('callback_url') ,
                'uri' => Request::input('uri') ,
                'domain' => Request::input('domain')]));

        return view('auth.login', [
            'callback_url' => Request::input('callback_url') ,
            'uri' => Request::input('uri') ,
            'domain' => Request::input('domain') ,
            'register_url' =>  $hasCallback  ? $registerCallbackUrl
            : url('/auth/register')
        ]);
    }

    function postLogin()
    {

        $callbackUrl = Request::input('callback_url');
        $uri = Request::input('uri');
        $domain = Request::input('domain');

        $hasCallback = ($callbackUrl != ''
            && $uri != ''
            && $domain != '');
        $registerCallbackUrl = url('auth/register?'.http_build_query([
                'callback_url' => Request::input('callback_url') ,
                'uri' => Request::input('uri') ,
                'domain' => Request::input('domain')]));
        $callbackData = [
            'callback_url' => Request::input('callback_url') ,
            'uri' => Request::input('uri') ,
            'domain' => Request::input('domain') ,
            'register_url' =>  $hasCallback  ? $registerCallbackUrl
                : url('/auth/register')
        ];


        $rules = array(
            'email' => 'required|email|max:255',
            'password' => 'required|min:6|max:255'
        );

        $validator = Validator::make(Input::all(), $rules);

        // if the validator fails, redirect back to the form
        if ($validator->fails())
        {
            $inputs = array_merge($callbackData, Input::except('password'));
            return view('auth.login', $inputs)
                ->withErrors($validator);
        }
        else
        {

            // create our user data for the authentication
            $userdata = array(
                'email'     => Input::get('email'),
                'password'  => Input::get('password')
            );
            if (Auth::attempt($userdata))
            {
                if( $hasCallback ) {

                    $callback_url = urldecode($callbackUrl);
                    $uri = urldecode($uri);
                    $domain = urldecode($domain);

                    $user = Auth::user();
                    // generate a auth token for this external site
                    $auth = AuthTable::add($domain, $user->id);

                    //check callback query string exist
                    $hasQuery = strstr($callback_url, '?');

                    //add token to query string
                    $callback_url .= '#anno_token='. $auth->auth_token;

                    //back to this external site
                    return redirect($callback_url);
                } else {
                    return redirect('/');
                }
            }
            else
            {

                $errors = new MessageBag(['password' => ['帳號或密碼錯誤']]); //
                // validation not successful, send back to form
                $inputs = Input::except('password');
                $inputs = array_merge($inputs,$callbackData);

                return view('auth.login', $inputs)
                    ->withErrors($errors);
            }
        }
    }

    function getRegister()
    {
        return view('auth.register', [
            'callback_url' => urlencode(Request::input('callback_url')) ,
            'uri' => urlencode(Request::input('uri')) ,
            'domain' => urlencode(Request::input('domain')) ,
        ]);
    }

    /**
     * Handle a registration request for the application.
     *
     * @return \Illuminate\Http\Response
     */
    public function postRegister()
    {
        $callbackUrl = Request::input('callback_url');
        $uri = Request::input('uri');
        $domain = Request::input('domain');
        $hasCallback =  ($callbackUrl != ''
            && $uri != ''
            && $domain != '');
        $callbackData = [
            'callback_url' => Request::input('callback_url') ,
            'uri' => Request::input('uri') ,
            'domain' => Request::input('domain') ,
        ];


        $validator = $this->validator(Request::all());
        if ($validator->fails()) {
            $inputs = $callbackData;
            $inputs = array_merge($inputs, Input::except('password'));

            return view('auth.register', $inputs)
                ->withErrors($validator);
        }

        Auth::login($this->create(Request::all()));

        if( $hasCallback ) {

            $callback_url = urldecode($callbackUrl);
            $domain = urldecode($domain);


            $user = Auth::user();
            // generate a auth token for this external site
            $auth = AuthTable::add($domain, $user->id);

            //add token to query string
            $callback_url .= '#user_id='. $user->id .'&anno_token='. $auth->auth_token;

            //back to this external site
            return redirect($callback_url);
        } else {
            return redirect('/');
        }


    }


    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
    }

    public function getFacebook()
    {

        /*$callback_url = Request::input('callback_url');
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

                    return redirect('auth/login');
                }
                // Send a request with it
                $fbuser = json_decode($fb->request('/me'), false);

                // user login
                $user = User::login($fbuser, $token->getAccessToken());
            }

            // check if it was external website called
            if($callback_url != null) {

                // generate a auth token for this external site
                $auth = AuthTable::add($callback_url, $user->id);

                //check callback query string exist
                $hasQuery = strstr($callback_url, '?');

                //add token to query string
                $callback_url .= '#user_id='. $user->id .'&anno_token='. $auth->auth_token;

                //back to this external site
                return redirect($callback_url);
            } else {
                //back to home page
                return redirect('/');
            }
        } else {
            // get fb authorization
            $url = $fb->getAuthorizationUri();

            // return to facebook login url

            return redirect((string)$url);
        }*/
    }


    function getLogout() {
        Auth::logout();
        return redirect('/');
    }

}