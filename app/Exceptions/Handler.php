<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use App\Mail\EmailSG;
use App\Http\Models\Util;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Illuminate\Validation\ValidationException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Illuminate\Session\TokenMismatchException::class,
        \Illuminate\Validation\ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        if(env('ERROR_SEND_INFO'))
        {
            if( Handler::sendReport(false) )
                Handler::reportException($exception);
        }
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof AuthenticationException) {
            return $this->unauthenticated($request, $exception);
        }
        if(env('ERROR_SEND_INFO'))
        {
            Log::info('View with the error showed to the user. Redirect to home page if it is production');
            if( Handler::sendReport(true) )
                return redirect()->route('index');
            return response()->view('errors.default', [], 500);
        }
        return parent::render($request, $exception);
    }

    /**
     * Convert an authentication exception into an unauthenticated response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        return redirect()->guest('login');
    }
    /**
     * Send email and Log an exception only.
     *
     *
     * @param  \Exception  $exception
     * @return void
     */
    public static function reportException(Exception $exception)
    {
        /*
            Log::emergency($message);
            Log::alert($message);
            Log::critical($message);
            Log::error($message);
            Log::warning($message);
            Log::notice($message);
            Log::info($message);
            Log::debug($message);
         */
        if (!($exception instanceof AuthenticationException) && !($exception instanceof TokenMismatchException) && !($exception instanceof ValidationException) 
        && !($exception instanceof NotFoundHttpException) && !($exception instanceof MethodNotAllowedHttpException))
        {
            Log::error($exception);
            $email = new EmailSG(['TicketBat Admin',env('MAIL_ERROR_FROM')],env('MAIL_ERROR_TO'),env('MAIL_ERROR_SUBJECT'));
            $client = Util::system_info();
            $user = (Auth::check())? Auth::user()->first_name.' '.Auth::user()->last_name.' ('.Auth::user()->email.') ' : '-Not logged user-';
            $html = '<b>Client: </b>'.$client.'<br><b> Date: </b>'.date('Y-m-d H:i:s').'<br><b> URL: </b>'.Request::url().'<br><b> User: </b>'.$user
                  . '<br><b>Code: </b>'.$exception->getCode().'<br><b>File: </b>'.$exception->getFile().' <b>Line: </b>'.$exception->getLine().'<br>'
                  . '<b>Message: </b>'.(string)$exception;
            $email->html($html);
            $email->send();
            Log::info('Email sent to '.env('MAIL_ERROR_TO').' with the error message.');
        }
    }
    /**
     * Flag to say enable or disable send errors email to the admin.
     *
     *
     * @param  \Exception  $exception
     * @return boolean
     */
    public static function sendReport($excludeException=false)
    {
        if(!preg_match('/\/admin\//',url()->current()) && !preg_match('/\/api\//',url()->current()))
            return (!$excludeException);
        return true;
    }
}
