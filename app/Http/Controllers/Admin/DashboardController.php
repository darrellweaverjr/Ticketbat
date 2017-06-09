<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Venue;
use App\Http\Models\Show;
use App\Http\Models\User;
use App\Http\Models\Util;

class DashboardController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('auth');
    }

    /**
     * Show the default method on the dashboard.
     *
     * @return Method
     */
    public function index()
    {
        return $this->ticket_sales();
    }
    
    /**
     * Makes where for queries in all report and search values.
     *
     * @return Method
     */
    private function search($input)
    {
        //init
        $data = ['where'=>[],'search'=>[]];
        $data['search']['venues'] = [];
        $data['search']['shows'] = [];
        $data['search']['payment_types'] = Util::getEnumValues('purchases','payment_type');
        $data['search']['users'] = User::get(['id','email']);
        //search venue
        if(isset($input) && isset($input['venue']))
        {
            $data['search']['venue'] = $input['venue'];
            if($data['search']['venue'] != '')
                $data['where'][] = ['shows.venue_id','=',$data['search']['venue']];
        }
        else
            $data['search']['venue'] = '';
        //search show
        if(isset($input) && isset($input['show']))
        {
            $data['search']['show'] = $input['show'];
            if($data['search']['show'] != '')
                $data['where'][] = ['shows.id','=',$data['search']['show']];
        }
        else
            $data['search']['show'] = '';
        //search showtime
        if(isset($input) && isset($input['showtime_start_date']) && isset($input['showtime_end_date']))
        {
            $data['search']['showtime_start_date'] = $input['showtime_start_date'];
            $data['search']['showtime_end_date'] = $input['showtime_end_date'];
        }
        else
        {
            $data['search']['showtime_start_date'] = '';
            $data['search']['showtime_end_date'] = '';
        }
        if($data['search']['showtime_start_date'] != '' && $data['search']['showtime_end_date'] != '')
        {
            $data['where'][] = [DB::raw('DATE(show_times.show_time)'),'>=',$data['search']['showtime_start_date']];
            $data['where'][] = [DB::raw('DATE(show_times.show_time)'),'<=',$data['search']['showtime_end_date']];
        } 
        //search soldtime
        if(isset($input) && isset($input['soldtime_start_date']) && isset($input['soldtime_end_date']))
        {
            $data['search']['soldtime_start_date'] = $input['soldtime_start_date'];
            $data['search']['soldtime_end_date'] = $input['soldtime_end_date'];
        }
        else
        {
            $data['search']['soldtime_start_date'] = date('Y-m-d', strtotime('-30 DAY'));
            $data['search']['soldtime_end_date'] = date('Y-m-d');
        }
        if($data['search']['soldtime_start_date'] != '' && $data['search']['soldtime_end_date'] != '')
        {
            $data['where'][] = [DB::raw('DATE(purchases.created)'),'>=',$data['search']['soldtime_start_date']];
            $data['where'][] = [DB::raw('DATE(purchases.created)'),'<=',$data['search']['soldtime_end_date']];
        }  
        //search payment types        
        if(isset($input) && isset($input['payment_type']) && !empty($input['payment_type']))
        {
            $data['search']['payment_type'] = $input['payment_type'];
        }
        else
        {
            $data['search']['payment_type'] = array_values($data['search']['payment_types']);
        }
        //search user      
        if(isset($input) && isset($input['payment_type']) && !empty($input['user']))
        {
            $data['search']['user'] = $input['user'];
            $data['where'][] = ['purchases.user_id','=',$data['search']['user']];
        }
        else
        {
            $data['search']['user'] = '';
        }
        //PERMISSIONS
        //if user has permission to view        
        if(in_array('View',Auth::user()->user_type->getACLs()['REPORTS']['permission_types']))
        {
            if(Auth::user()->user_type->getACLs()['REPORTS']['permission_scope'] != 'All')
            {
                if(!empty(Auth::user()->venues_edit) && count(explode(',',Auth::user()->venues_edit)))
                {
                    $data['where'][] = [DB::raw('shows.venue_id IN ('.Auth::user()->venues_edit.') OR shows.create_user_id'),'=',Auth::user()->id];
                    //add shows and venues for search
                    $data['search']['venues'] = Venue::whereIn('id',explode(',',Auth::user()->venues_edit))->orderBy('name')->get(['id','name']);
                    $data['search']['shows'] = Show::whereIn('venue_id',explode(',',Auth::user()->venues_edit))->orWhere('create_user_id',Auth::user()->id)->orderBy('name')->get(['id','name','venue_id']);
                } 
                else 
                    $data['where'][] = ['shows.create_user_id','=',Auth::user()->id];
            }  
            //all
            else 
            {
                //add shows and venues for search
                $data['search']['venues'] = Venue::orderBy('name')->get(['id','name']);
                $data['search']['shows'] = Show::orderBy('name')->get(['id','name','venue_id']);
            }  
        }
        else
            $data['where'][] = ['purchases.id','=',0];
        //return     
        return $data;
    }
    
    /**
     * Show the ticket sales report on the dashboard.
     *
     * @return view
     */
    public function ticket_sales()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = array();
            //conditions to search
            $data = $this->search($input);
            $where = $data['where'];
            $where[] = ['purchases.status','=','Active'];
            $search = $data['search'];
            //get all records        
            $data = DB::table('purchases')
                        ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                        ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                        ->join('customers', 'customers.id', '=' ,'purchases.customer_id')
                        ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                        ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                        ->join('discounts', 'discounts.id', '=' ,'purchases.discount_id')
                        ->select(DB::raw('purchases.id, CONCAT(customers.first_name," ",customers.last_name) as name, shows.name AS show_name, 
                                          tickets.ticket_type, purchases.created, show_times.show_time, discounts.code, venues.name AS venue_name,
                                          (CASE WHEN (purchases.ticket_type = "Consignment") THEN purchases.ticket_type ELSE purchases.payment_type END) AS method,
                                          SUM(purchases.quantity) AS tickets, 
                                          SUM(ROUND(purchases.price_paid,2)) AS price_paids, 
                                          SUM(ROUND(purchases.retail_price,2)) AS retail_prices, 
                                          SUM(ROUND(purchases.savings,2)) AS discounts, 
                                          SUM(ROUND(purchases.processing_fee,2)) AS fees, 
                                          SUM(ROUND(purchases.retail_price-purchases.savings-purchases.commission_percent,2)) AS to_show, 
                                          SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                        ->where($where)
                        ->orderBy('purchases.created','DESC')->groupBy('purchases.id')
                        ->havingRaw('method IN ("'.implode('","',$data['search']['payment_type']).'")')
                        ->get()->toArray();
            //calculate totals
            $total = array( 'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees'=>array_sum(array_column($data,'fees')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.ticket_sales',compact('data','total','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Ticket Sales: '.$ex->getMessage());
        }
    }
    
    /**
     * Show the chargeback report on the dashboard.
     *
     * @return view
     */
    public function chargebacks()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = array();
            //conditions to search
            $data = $this->search($input);
            $where = $data['where'];
            $where[] = ['purchases.status','=','Chargeback'];
            $search = $data['search'];
            //get all records        
            $data = DB::table('purchases')
                        ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                        ->join('customers', 'customers.id', '=' ,'purchases.customer_id')
                        ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                        ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                        ->join('transactions', 'transactions.id', '=' ,'purchases.transaction_id')
                        ->select(DB::raw('purchases.id, COALESCE(transactions.card_holder,CONCAT(customers.first_name," ",customers.last_name)) AS card_holder, 
                                          COALESCE(transactions.refnum,0) AS refnum, COALESCE(transactions.amount,0) AS amount, COALESCE(transactions.authcode,0) AS authcode, 
                                          shows.name AS show_name, show_times.show_time, purchases.status AS status, venues.name AS venue_name,
                                          purchases.quantity AS tickets, purchases.transaction_id, purchases.ticket_type, purchases.created, purchases.note '))
                        ->where($where)
                        ->orderBy('purchases.created','DESC')->groupBy('purchases.id')->get()->toArray();
            //calculate totals
            $total = array( 'amount'=>array_sum(array_column($data,'amount')),
                            'tickets'=>array_sum(array_column($data,'tickets')));
            //return view
            return view('admin.dashboard.chargebacks',compact('data','total','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Chargebacks: '.$ex->getMessage());
        }
    }
    
    /**
     * Show the future_liabilities report on the dashboard.
     *
     * @return view
     */
    public function future_liabilities()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = array();
            $current = date('Y-m-d H:i:s');
            //conditions to search
            $data = $this->search($input);
            $where = $data['where'];
            $where[] = ['purchases.status','=','Active'];
            $where[] = ['show_times.show_time','>',$current];
            $search = $data['search'];
            //get all records        
            $data = DB::table('purchases')
                        ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                        ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                        ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                        ->select(DB::raw('shows.id, shows.name, COUNT(purchases.id) AS purchases, venues.name AS venue_name,
                                    SUM(purchases.quantity) AS tickets, 
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids, 
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices, 
                                    SUM(ROUND(purchases.savings,2)) AS discounts, 
                                    SUM(ROUND(purchases.processing_fee,2)) AS fees, 
                                    SUM(ROUND(purchases.retail_price-purchases.savings-purchases.commission_percent,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions '))
                        ->where($where)
                        ->orderBy('shows.name')->groupBy('shows.id')->get()->toArray();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees'=>array_sum(array_column($data,'fees')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.future_liabilities',compact('data','total','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Future Liabilities: '.$ex->getMessage());
        }
    }
    
    /**
     * Show the Trend and Pace report on the dashboard.
     *
     * @return view
     */
    public function trend_pace()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = $graph = array();
            //conditions to search
            $data = $this->search($input);
            $where = $data['where'];
            $where[] = ['purchases.status','=','Active'];
            $search = $data['search'];
            //get all records        
            $data = DB::table('purchases')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                    ->select(DB::raw('shows.name AS show_name, COUNT(purchases.id) AS purchases, show_times.show_time, venues.name AS venue_name,
                                    COALESCE((SELECT SUM(pp.quantity) FROM purchases pp INNER JOIN show_times stt ON stt.id = pp.show_time_id 
                                              WHERE stt.show_id = shows.id AND DATE(pp.created)=DATE_SUB(CURDATE(),INTERVAL 1 DAY)),0) AS tickets_one,
                                    COALESCE((SELECT SUM(pp.quantity) FROM purchases pp INNER JOIN show_times stt ON stt.id = pp.show_time_id 
                                              WHERE stt.show_id = shows.id AND DATE(pp.created)=DATE_SUB(CURDATE(),INTERVAL 2 DAY)),0) AS tickets_two,
                                    SUM(purchases.quantity) AS tickets, 
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids, 
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices, 
                                    SUM(ROUND(purchases.savings,2)) AS discounts, 
                                    SUM(ROUND(purchases.processing_fee,2)) AS fees, 
                                    SUM(ROUND(purchases.retail_price-purchases.savings-purchases.commission_percent,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                    ->where($where)
                    ->orderBy('shows.name','show_times.show_time desc')->groupBy('show_times.id')->get()->toArray();
            //info for the graph 
            $start = date('Y-m-d', strtotime('-1 year'));
            $where[] = ['purchases.created','>=',$start];
            $graph = DB::table('purchases')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->select(DB::raw('DATE_FORMAT(purchases.created,"%m/%Y") AS purchased, 
                                    SUM(purchases.quantity) AS qty_tickets, COUNT(purchases.id) AS qty_purchases, SUM(purchases.commission_percent+purchases.processing_fee) AS amount'))
                    ->where($where)
                    ->whereRaw(DB::raw('DATE_FORMAT(purchases.created,"%Y%m") >= '.$start))
                    ->groupBy(DB::raw('DATE_FORMAT(purchases.created,"%Y%m")'))->get()->toJson();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees'=>array_sum(array_column($data,'fees')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.trend_pace',compact('data','total','graph','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Trend and Pace: '.$ex->getMessage());
        }
    }
    
    /**
     * Show the Referrals report on the dashboard.
     *
     * @return view
     */
    public function referrals()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = array();
            //conditions to search
            $data = $this->search($input);
            $where = $data['where'];
            $where[] = ['purchases.status','=','Active'];
            $search = $data['search'];
            //search arrange by order url or show
            if(isset($input) && isset($input['order']) && $input['order']=='url')
            {
                $order = 'url';
                $groupby = 'referral_url,show_name';
                $orderby = 'referral_url,show_name';
            }    
            else
            {
                $order = 'show';
                $groupby = 'show_name,referral_url';
                $orderby = 'show_name,referral_url';
            }
            $search['order'] = $order;
            $data = DB::table('purchases')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                    ->select(DB::raw('shows.name AS show_name, COUNT(purchases.id) AS purchases, venues.name AS venue_name,
                                    COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(purchases.referrer_url, "://", -1),"/", 1), "-Not Registered-") AS referral_url,
                                    SUM(purchases.quantity) AS tickets, 
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids, 
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices, 
                                    SUM(ROUND(purchases.savings,2)) AS discounts, 
                                    SUM(ROUND(purchases.processing_fee,2)) AS fees, 
                                    SUM(ROUND(purchases.retail_price-purchases.savings-purchases.commission_percent,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                    ->where($where)
                    ->whereNotNull('purchases.referrer_url')
                    ->groupBy(DB::raw($groupby))->orderBy(DB::raw($orderby))->get()->toArray();
            //info for the graph 
            if($order=='url')
                $groupby = 'referral_url';
            else
                $groupby = 'shows.id';
            $graph['url'] = DB::table('purchases')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->select(DB::raw('COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(purchases.referrer_url, "://", -1),"/", 1), "-Not Registered-") AS referral_url,
                                      SUM(purchases.processing_fee+purchases.commission_percent) AS amount'))
                    ->where($where)
                    ->whereNotNull('purchases.referrer_url')
                    ->groupBy('referral_url')->orderBy('amount','ASC')->distinct()->get()->toJson();
            $graph['show'] = DB::table('purchases')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->select(DB::raw('SUM(purchases.processing_fee+purchases.commission_percent) AS amount, shows.name AS show_name'))
                    ->where($where)
                    ->whereNotNull('purchases.referrer_url')
                    ->groupBy('show_name')->orderBy('amount','ASC')->distinct()->get()->toJson();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees'=>array_sum(array_column($data,'fees')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.referrals',compact('data','total','graph','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Referrals: '.$ex->getMessage());
        }
    }
    
}
