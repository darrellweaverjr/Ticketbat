<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Barryvdh\DomPDF\Facade as PDF;
use App\Http\Models\Purchase;

class UserPurchaseController extends Controller
{
    /**
     * Purchases options.
     *
     * @return Method
     */
    public function index()
    {
        try {
            //get all records
            $purchases = DB::table('purchases')
                        ->join('show_times', 'show_times.id', '=', 'purchases.show_time_id')
                        ->join('shows', 'shows.id', '=', 'show_times.show_id')
                        ->join('venues', 'venues.id', '=', 'shows.venue_id')
                        ->join('tickets', 'tickets.id', '=', 'purchases.ticket_id')
                        ->join('packages', 'packages.id', '=', 'tickets.package_id')
                        ->select(DB::raw('purchases.id, shows.name AS show_name, venues.name AS venue_name, tickets.ticket_type, 
                                          IF(packages.title!="None",packages.title,"") AS title, purchases.status,
                                          IF(show_times.show_time>NOW(),1,0) AS passed,
                                          show_times.show_time, purchases.created, purchases.quantity, purchases.price_paid'))
                        ->where('purchases.user_id', Auth::user()->id)->orderBy('purchases.created','DESC')->get();
            //return view
            return view('production.user.purchases',compact('purchases'));
        } catch (Exception $ex) {
            throw new Exception('Error Production User Purchases: '.$ex->getMessage());
        }
    }
    /**
     * Purchases options Receipts.
     *
     * @return Method
     */
    public function receipts($id)
    {
        try {
            //get receipt
            $receipt = Purchase::find($id)->get_receipt();
            $format = 'pdf';
            //create pdf receipt
            $purchase = array_merge((array)$receipt['purchase'],(array)$receipt['customer']);
            $purchase['price_each'] = round($purchase['retail_price']/$purchase['qty'],2);
            $pdf_receipt = View::make('command.report_sales_receipt', compact('purchase','format'));  
            return PDF::loadHTML($pdf_receipt->render())->setPaper('a4', 'portrait')->setWarnings(false)->download('TicketBat Purchase Receipt #'.$id.'.pdf');
        } catch (Exception $ex) {
            return redirect()->route('index');
        }
    }
    /**
     * Purchases options Tickets.
     *
     * @return Method
     */
    public function tickets($id)
    {
        try {
            //get tickets
            $tickets = Purchase::find($id)->get_receipt()['tickets'];
            $format = 'pdf'; $type = 'C';
            //create pdf tickets
            $pdf_receipt = View::make('command.report_sales_receipt_tickets', compact('tickets','type','format')); 
            return PDF::loadHTML($pdf_receipt->render())->setPaper('a4', 'portrait')->setWarnings(false)->download('TicketBat Purchase Tickets #'.$id.'.pdf');
        } catch (Exception $ex) {
            return redirect()->route('index');
        }
    }
    /**
     * Purchases options Share tickets.
     *
     * @return Method
     */
    public function share()
    {
        try {
            //init
            $input = Input::all(); 
            if(isset($input) && !empty($input['id']))
            {
                $tickets = DB::table('ticket_number')
                            ->join('customers', 'customers.id', '=', 'ticket_number.customers_id')
                            ->join('purchases', 'purchases.id', '=', 'ticket_number.purchases_id')
                            ->select(DB::raw('ticket_number.id, ticket_number.tickets, IF(ticket_number.comment,ticket_number.comment,"") AS comment,
                                              customers.first_name, customers.last_name, customers.email'))
                            ->whereColumn('ticket_number.customers_id','<>','purchases.customer_id')
                            ->where('ticket_number.purchases_id', $input['id'])
                            ->groupBy('ticket_number.id')->orderBy('ticket_number.id','DESC')->get();
                return ['success'=>true,'tickets'=>$tickets];
            }
            else
            {
                $shared = [];
                if(!empty($input['email']) && !empty($input['first_name']) && !empty($input['last_name']) && !empty($input['qty']))
                {
                    $indexes = array_keys($input['email']);
                    foreach ($indexes as $i)
                        $shared[] = ['first_name'=>$input['first_name'][$i],'last_name'=>$input['last_name'][$i],'email'=>$input['email'][$i],
                                     'comment'=>(!empty($input['comment'][$i]))? $input['comment'][$i] : null,'qty'=>$input['qty'][$i]];
                }
                $purchase = Purchase::find($input['purchases_id']);
                if($purchase->share_tickets($shared))
                {
                    $receipt = $purchase->get_receipt();
                    Purchase::email_receipts('TicketBat Purchase',[$receipt],'receipt',null,true);
                    return ['success'=>true,'msg'=> 'Tickets shared successfully.<br>You should receive an email with the new receipts and tickets.'];
                } 
                return ['success'=>false,'msg'=> 'There was an error sharing the tickets.<br>Please contact us.'];
            }
        } catch (Exception $ex) {
            throw new Exception('Error Production User Purchases Share tickets: '.$ex->getMessage());
        }
    }
           
}
