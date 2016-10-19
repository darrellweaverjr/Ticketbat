<?php

namespace App\Mail;

use SendGrid;
use App\Exceptions\Handler;
use Illuminate\Support\Facades\Log;

/**
 * Class EmailSG sends emails thru SendGrid
 *
 * @author ivan
 */
class EmailSG {

    protected $mail;
    protected $sendGrid;

    public function __construct($from, $to, $subject) {
        try {
            //init
            $this->sendGrid = new \SendGrid(env('MAIL_SENDGRID_API_KEY'));
            $this->mail = new SendGrid\Mail();
            $this->mail->addPersonalization(new SendGrid\Personalization());
            //from
            if (isset($from)) {
                if (is_array($from)) {
                    $e = new SendGrid\Email($from[0], $from[1]);
                    $this->mail->setFrom($e);
                } else {
                    $e = new SendGrid\Email(null, $from);
                    $this->mail->setFrom($e);
                }
            } else {
                $e = new SendGrid\Email(env('MAIL_FROM_NAME'), env('MAIL_FROM'));
                $this->mail->setFrom($e);
            }
            //to
            if (isset($to)) {
                if (is_string($to)) {
                    $to = explode(",", $to);
                }
                if (is_array($to) && count($to) > 0) {
                    foreach ($to as $t) {
                        $this->filter($t);
                    }
                } else
                    return false;
            } else
                return false;
            //subject
            if (isset($subject)) {
                $this->mail->setSubject($subject);
            }
        } catch (Exception $ex) {
            throw new Exception('Error creating EmailSG: '.$ex->getMessage());
        }
    }

    public function filter($e, $placed = 'to') {
        try {
            $email = null;
            if (!filter_var($e, FILTER_VALIDATE_EMAIL) === false) {
                if (str_contains(url()->current(), 'dev.ticketbat') || str_contains(url()->current(), 'qa.ticketbat')) {
                    if (strpos(env('MAIL_TEST'), trim($e)) !== FALSE) {
                        $email = new SendGrid\Email(null, $e);
                    } else {
                        $email = new SendGrid\Email(null, env('MAIL_ADMIN'));
                    }
                } else {
                    $email = new SendGrid\Email(null, $e);
                }
                if ($email) {
                    switch ($placed) {
                        case 'bcc':
                            $this->mail->personalization[0]->addBcc($email);
                            break;
                        case 'cc':
                            $this->mail->personalization[0]->addCc($email);
                            break;
                        default:
                            $this->mail->personalization[0]->addTo($email);
                            break;
                    }
                    return true;
                } else
                    return false;
            } else
                return false;
        } catch (Exception $ex) {
            throw new Exception('Error filtering emails EmailSG: '.$ex->getMessage());
        }
    }

    public function reply($replyto) {
        try {
            $this->mail->setReplyTo(new ReplyTo($replyto));
        } catch (Exception $ex) {
            throw new Exception('Error adding reply EmailSG: '.$ex->getMessage());
        }        
    }

    public function bcc($bcc) {
        try {
            if (is_array($bcc)) {
                $email = new SendGrid\Email($bcc[0], $bcc[1]);
            } else {
                $email = new SendGrid\Email(null, $bcc);
            }
            $this->mail->personalization[0]->addBcc($email);
        } catch (Exception $ex) {
            throw new Exception('Error adding bcc EmailSG: '.$ex->getMessage());
        }        
    }

    public function cc($cc) {
        try {
            if (is_array($cc)) {
                $email = new SendGrid\Email($cc[0], $cc[1]);
            } else {
                $email = new SendGrid\Email(null, $cc);
            }
            $this->mail->personalization[0]->addCc($email);
        } catch (Exception $ex) {
            throw new Exception('Error adding cc EmailSG: '.$ex->getMessage());
        }        
    }

    public function category($category) {
        try {
            $this->mail->addCategory($category);
        } catch (Exception $ex) {
            throw new Exception('Error adding category EmailSG: '.$ex->getMessage());
        }        
    }

    public function attachment($attach) {
        try {
            if (is_string($attach)) {
                $attach = explode(",", $attach);
            }
            if (is_array($attach) && count($attach) > 0) {
                foreach ($attach as $a) {
                    $attachment = new SendGrid\Attachment();
                    $attachment->setContent(base64_encode(file_get_contents($a)));
                    $attachment->setFilename($a);
                    $this->mail->addAttachment($attachment);
                }
                return true;
            } else
                return false;
        } catch (Exception $ex) {
            throw new Exception('Error adding attachment EmailSG: '.$ex->getMessage());
        }         
    }

    public function view($view) {
        try {
            $this->html($view->render());
        } catch (Exception $ex) {
            throw new Exception('Error adding view EmailSG: '.$ex->getMessage());
        }        
    }

    public function html($html) {
        try {
            $content = new SendGrid\Content("text/html", $html);
            $this->mail->addContent($content);
        } catch (Exception $ex) {
            throw new Exception('Error adding html EmailSG: '.$ex->getMessage());
        }        
    }

    public function text($text) {
        try {
            $content = new SendGrid\Content("text/plain", $text);
            $this->mail->addContent($content);
        } catch (Exception $ex) {
            throw new Exception('Error adding text EmailSG: '.$ex->getMessage());
        }        
    }

    public function template($template) {
        try {
            $this->mail->setTemplateId($template);
        } catch (Exception $ex) {
            throw new Exception('Error adding template EmailSG: '.$ex->getMessage());
        }        
    }

    public function body($type, $body) {
        try {
            if (is_array($body)) {
                $data = $this->replace($type, $body);
                foreach ($data as $e) {
                    $this->mail->personalization[0]->addSubstitution($e['variable'], $e['value']);
                }
            } else
                return false;
        } catch (Exception $ex) {
            throw new Exception('Error adding body EmailSG: '.$ex->getMessage());
        }        
    }

    public function send() {
        try {
            $response = $this->sendGrid->client->mail()->send()->post($this->mail); 
            switch (true)
            {
                case (int)$response->statusCode() == 202: 
                    //Log::info('Email sent thru SendGrid successfully');
                    return true;
                case (int)$response->statusCode() >= 500: 
                    Log::error('Error sending email made by SendGrid');
                    return false;
                case (int)$response->statusCode() >= 400: 
                    Log::error('Error sending email with the request on SendGrid');
                    return false;
                default: 
                    Log::warning('Successful request on SendGrid');
                    return false;
            }
        } catch (Exception $ex) { 
            Handler::reportException($ex);
            return false;
        }
    }

    public function replace($type, $data) {
        try {
            $body = array();
            switch ($type) {
                case 'manifest': {
                        if (isset($data)) {
                            $body[] = array('variable' => ':type', 'value' => $data['type']);
                            $body[] = array('variable' => ':showname', 'value' => $data['name']);
                            $body[] = array('variable' => ':showdate', 'value' => date('m/d/Y g:ia',strtotime($data['date_now'])));
                        }
                        break;
                    }
                case 'sales_report': {
                        if (isset($data)) {
                            $body[] = array('variable' => ':date', 'value' => $data['date']);
                        }
                        break;
                    }
                case 'reminder': {
                        if (isset($data['purchase']) && is_array($data['purchase'])) {
                            foreach ($data['purchase'] as $purchase) {
                                $body[] = array('variable' => ':show_name', 'value' => $purchase->show_name);
                                $body[] = array('variable' => ':show_date', 'value' => date("Y-m-d", strtotime($purchase->show_time)));
                                $body[] = array('variable' => ':show_time', 'value' => date("H:i:s", strtotime($purchase->show_time)));
                                $body[] = array('variable' => ':purchase_id', 'value' => $purchase->id);
                                $body[] = array('variable' => ':transaction_id', 'value' => $purchase->transaction_id);
                                $body[] = array('variable' => ':user_id', 'value' => $purchase->user_id);
                            }
                        }
                        if (isset($data['customer'])) {
                            $body[] = array('variable' => ':name', 'value' => $data['customer']['first_name'] . ' ' . $data['customer']['last_name']);
                        }
                        break;
                    }
                case 'recover_cart': {
                        if (isset($data['email']) && isset($data['name']) && $data['link']) {
                            $body[] = array('variable' => ':email', 'value' => $data['email']);
                            $body[] = array('variable' => ':name', 'value' => $data['name']);
                            $body[] = array('variable' => ':link', 'value' => $data['link']);
                            $body[] = array('variable' => ':images', 'value' => $data['images']);
                        }
                        break;
                    }
                case 'promos_weekly': {
                        if (isset($data['weekly_promos'])) {
                            $body[] = array('variable' => ':promos', 'value' => $data['weekly_promos']);
                        }
                        break;
                    }
                case 'welcome': {
                        if (isset($data)) {
                            $body[] = array('variable' => ':username', 'value' => $data['username']);
                            $body[] = array('variable' => ':password', 'value' => $data['password']);
                        }
                        break;
                    }  
                default:
                    break;
            }
            return $body;
        } catch (Exception $ex) {
            throw new Exception('Error replacing body EmailSG: '.$ex->getMessage());
        }        
    }

}
