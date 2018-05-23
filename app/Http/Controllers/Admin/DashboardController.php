<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Purchase;

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
        //load first and default module depending of permission, logout if none or not valid user
        if(Auth::check()
            && in_array(Auth::user()->user_type_id,explode(',',env('ADMIN_LOGIN_USER_TYPE')))
            && !empty(Auth::user()->user_type->getACLs()) )
        {
            $permits = Auth::user()->user_type->getACLs();
            if(!empty($permits['REPORTS']))
                return redirect('/admin/dashboard/ticket_sales');
            if(!empty($permits['USERS']))
                return redirect('/admin/users');
            if(!empty($permits['BANDS']))
                return redirect('/admin/bands');
            if(!empty($permits['VENUES']))
                return redirect('/admin/venues');
            if(!empty($permits['SHOWS']))
                return redirect('/admin/shows');
            if(!empty($permits['TYPES']))
                return redirect('/admin/ticket_types');
            if(!empty($permits['CATEGORIES']))
                return redirect('/admin/categories');
            if(!empty($permits['COUPONS']))
                return redirect('/admin/coupons');
            if(!empty($permits['PACKAGES']))
                return redirect('/admin/packages');
            if(!empty($permits['ACLS']))
                return redirect('/admin/acls');
            if(!empty($permits['MANIFESTS']))
                return redirect('/admin/manifests');
            if(!empty($permits['CONTACTS']))
                return redirect('/admin/contacts');
            if(!empty($permits['PURCHASES']))
                return redirect('/admin/purchases');
            if(!empty($permits['SLIDERS']))
                return redirect('/admin/sliders');
            if(!empty($permits['CONSIGNMENTS']))
                return redirect('/admin/consignments');
            if(!empty($permits['RESTAURANTS']))
                return redirect('/admin/restaurants');
        }
        return redirect()->route('logout');
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
            $data = $total = $summary = $coupons = array();
            //conditions to search
            $data = Purchase::filter_options('REPORTS', $input, '-7');
            //enable only valid purchase status
            foreach ($data['search']['status'] as $k=>$v)
                if($v!='Active' && $v!='Refunded' && !(strpos($v,'Pending')===0))
                    unset($data['search']['status'][$k]);
            $where = $data['where'];
            $search = $data['search'];
            //coupon's report
            if(!empty($search['coupon_report']))
                $coupons = $this->coupons($data);
            //get all records
            $data = DB::table('purchases')
                        ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                        ->join('packages', 'packages.id', '=' ,'tickets.package_id')
                        ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                        ->join('customers', 'customers.id', '=' ,'purchases.customer_id')
                        ->join('users', 'users.id', '=' ,'purchases.user_id')
                        ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                        ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                        ->join('discounts', 'discounts.id', '=' ,'purchases.discount_id')
                        ->leftJoin('transactions', 'transactions.id', '=' ,'purchases.transaction_id')
                        ->leftJoin('transaction_refunds', 'purchases.id', '=' ,'transaction_refunds.purchase_id')
                        ->select(DB::raw('purchases.id, CONCAT(customers.first_name," ",customers.last_name) as name, customers.email,  shows.name AS show_name, 
                                          purchases.created, show_times.show_time, discounts.code, venues.name AS venue_name, tickets.inclusive_fee,
                                          ( CASE WHEN (discounts.discount_type = "N for N") THEN "BOGO"
                                                 WHEN (purchases.payment_type="None") THEN "Comp."
                                                 ELSE purchases.payment_type END ) AS method, tickets.ticket_type, packages.title,
                                          transactions.card_holder, transactions.authcode, transactions.refnum, transactions.last_4,
                                          COUNT(purchases.id) AS purchases, purchases.status, purchases.channel, purchases.note,
                                          SUM(purchases.quantity) AS tickets,  purchases.retail_price, purchases.printed_fee,
                                          SUM( IF(purchases.inclusive_fee>0, 0 , purchases.processing_fee) ) AS fees, purchases.savings,
                                          SUM( IF(purchases.inclusive_fee>0, 
                                            purchases.price_paid-purchases.retail_price-purchases.sales_taxes+purchases.savings-purchases.printed_fee,
                                            purchases.price_paid-purchases.processing_fee-purchases.retail_price-purchases.sales_taxes+purchases.savings-purchases.printed_fee )) AS other,
                                          purchases.sales_taxes, purchases.price_paid, purchases.cc_fees, 
                                          ROUND(purchases.price_paid-purchases.processing_fee-purchases.commission_percent-purchases.cc_fees-purchases.printed_fee,2) AS to_show,
                                          SUM( IF(purchases.inclusive_fee>0, purchases.processing_fee, 0) ) AS fees_incl,
                                          SUM( IF(purchases.inclusive_fee>0, 0, purchases.processing_fee) ) AS fees_over,
                                          purchases.commission_percent AS commissions,
                                          ROUND(purchases.processing_fee+purchases.commission_percent+purchases.printed_fee,2) AS profit,
                                          COALESCE(transaction_refunds.created,purchases.updated) AS refunded, 
                                          SUM( IF(purchases.status="Refunded", COALESCE(transaction_refunds.amount,purchases.price_paid,0), 0 ) ) AS refunds'))
                        ->where($where)
                        ->where(function($query) {
                            $query->whereNull('transaction_refunds.id')
                                  ->orWhere('transaction_refunds.result','=','Approved');
                        })
                        ->where(function($query) {
                            $query->where('purchases.status','=','Active')
                                  ->orWhere('purchases.status','=','Refunded')
                                  ->orWhere('purchases.status','like','Pending%');
                        })
                        ->groupBy('purchases.id')->orderBy('purchases.id','DESC')->get()->toArray();
            //calculate totals
            function calc_totals($data,$ref=false)
            {
                $array = [  'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'savings'=>array_sum(array_column($data,'savings')),
                            'sales_taxes'=>array_sum(array_column($data,'sales_taxes')),
                            'price_paid'=>array_sum(array_column($data,'price_paid')),
                            'cc_fees'=>array_sum(array_column($data,'cc_fees')),
                            'printed_fee'=>array_sum(array_column($data,'printed_fee')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'fees_incl'=>array_sum(array_column($data,'fees_incl')),
                            'fees_over'=>array_sum(array_column($data,'fees_over')),
                            'commissions'=>array_sum(array_column($data,'commissions')),
                            'refunds'=>array_sum(array_column($data,'refunds')),
                            'profit'=>array_sum(array_column($data,'profit')) ];
                if($ref)                   
                    return array_merge ($array,['purchases_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->purchases : 0; }, $data)),
                                                'tickets_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->tickets : 0; }, $data)),
                                                'savings_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->savings : 0; }, $data)),
                                                'sales_taxes_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->sales_taxes : 0; }, $data)),
                                                'price_paid_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->price_paid : 0; }, $data)),
                                                'cc_fees_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->cc_fees : 0; }, $data)),
                                                'printed_fee_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->printed_fee : 0; }, $data)),
                                                'to_show_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->to_show : 0; }, $data)),
                                                'fees_incl_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->fees_incl : 0; }, $data)),
                                                'fees_over_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->fees_over : 0; }, $data)),
                                                'commissions_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->commissions : 0; }, $data)),
                                                'profit_'=>array_sum(array_map(function($i) { return ($i->status=='Refunded')? $i->profit : 0; }, $data)) ] ); 
                return $array;
            }
            $total = calc_totals($data,true);
            //clear date sold for comparisons
            function clear_date_sold($where)
            {
                return array_filter($where, function($value){
                    if (strstr($value[0], 'purchases.created') !== false)
                       return false;
                    return true;
                });
            }
            //calculate summary table according to period
            function cal_summary($period,$where,$search,$type='previous')
            {
                $title = 'Current: <i>( '.date('M jS Y',strtotime($search['soldtime_start_date'])).' - '.date('M jS Y',strtotime($search['soldtime_end_date'])).' )</i>';
                if(!empty($period))
                {
                    if(!empty($search['soldtime_start_date']) && !empty($search['soldtime_end_date']))
                    {
                        if($type=='previous_period')
                        {
                            //calculate date range according to period
                            $start_date = strtotime($search['soldtime_start_date']);
                            $end_date = strtotime($search['soldtime_end_date']);
                            $diff_days = floor(($end_date-$start_date) / (60*60*24));
                            //if full month
                            if(  date('Y-m-d',strtotime('first day of this month',$start_date)) == $search['soldtime_start_date']
                              && date('Y-m-d',strtotime('last day of this month',$end_date)) == $search['soldtime_end_date'] )
                            {
                                $start_date = date('Y-m-d',strtotime('first day of this month '.$period.' months ago',$start_date));
                                $end_date = date('Y-m-d',strtotime('last day of this month '.$period.' months ago',$end_date));
                            }
                            else if(  date('Y-m-d',strtotime('first day of this year',$start_date)) == $search['soldtime_start_date']
                              && date('Y-m-d',strtotime('last day of this year',$end_date)) == $search['soldtime_end_date'] )
                            {
                                $start_date = date('Y-m-d',strtotime('first day of this year '.$period.' years ago',$start_date));
                                $end_date = date('Y-m-d',strtotime('last day of this year '.$period.' years ago',$end_date));
                            }
                            else
                            {
                                $diff_days = ($diff_days + 1) * $period;
                                $start_date = date('Y-m-d',strtotime('-'.$diff_days.' days',$start_date));
                                $end_date = date('Y-m-d',strtotime('-'.$diff_days.' days',$end_date));
                            }
                        }
                        else if($type=='previous_year')
                        {
                            //calculate date range according to yearly
                            $start_date = strtotime($search['soldtime_start_date'].' -'.$period.' year');
                            $end_date = strtotime($search['soldtime_end_date'].' -'.$period.' year');
                            $diff_days = floor(($end_date-$start_date) / (60*60*24));
                            //if full month
                            if(  date('Y-m-d',strtotime('first day of this month',$start_date)) ==$start_date
                              && date('Y-m-d',strtotime('last day of this month',$end_date)) == $end_date )
                            {
                                $start_date = date('Y-m-d',strtotime('first day of this month '.$period.' months ago',$start_date));
                                $end_date = date('Y-m-d',strtotime('last day of this month '.$period.' months ago',$end_date));
                            }
                            else
                            {
                                $start_date = date('Y-m-d',$start_date);
                                $end_date = date('Y-m-d',$end_date);
                            }
                        }
                        else return ['title'=>$title,'table'=>[]];

                        //remove previous date comparison
                        $where = clear_date_sold($where);
                        //set up new date period
                        $where[] = [DB::raw('DATE(purchases.created)'),'>=',$start_date];
                        $where[] = [DB::raw('DATE(purchases.created)'),'<=',$end_date];
                        $title = 'Period '.$period.': <i>( '.date('M jS Y',strtotime($start_date)).' - '.date('M jS Y',strtotime($end_date)).' )</i>';
                    }
                    else return ['title'=>$title,'table'=>[]];
                }

                $summary_table = [];
                $subtotals = $consignment = ['purchases'=>0,'tickets'=>0,'price_paid'=>0,'savings'=>0,'to_show'=>0,'commissions'=>0,'fees_incl'=>0,'fees_over'=>0,
                                             'profit'=>0,'sales_taxes'=>0,'cc_fees'=>0,'printed_fee'=>0];
                $summary_info = DB::table('purchases')
                            ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                            ->join('customers', 'customers.id', '=' ,'purchases.customer_id')
                            ->join('users', 'users.id', '=' ,'purchases.user_id')
                            ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                            ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                            ->join('discounts', 'discounts.id', '=' ,'purchases.discount_id')
                            ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                            ->select(DB::raw('( CASE WHEN (discounts.discount_type = "N for N") THEN "BOGO"
                                                     WHEN (purchases.payment_type="None") THEN "Comp."
                                                     ELSE purchases.payment_type END ) AS method, purchases.channel,
                                              COUNT(purchases.id) AS purchases,
                                              SUM(purchases.quantity) AS tickets, SUM(purchases.printed_fee) AS printed_fee,  
                                              SUM(ROUND(purchases.commission_percent+purchases.processing_fee,2)) AS profit,
                                              SUM(ROUND(purchases.price_paid,2)) AS price_paid,
                                              SUM(ROUND(purchases.savings,2)) AS savings,
                                              SUM(ROUND(purchases.cc_fees,2)) AS cc_fees, SUM(ROUND(purchases.printed_fee,2)) AS printed_fee,
                                              SUM(ROUND(purchases.sales_taxes,2)) AS sales_taxes,
                                              SUM( IF(purchases.inclusive_fee>0, ROUND(purchases.processing_fee,2), 0) ) AS fees_incl,
                                              SUM( IF(purchases.inclusive_fee>0, 0, ROUND(purchases.processing_fee,2)) ) AS fees_over,
                                              SUM(ROUND(purchases.price_paid-purchases.commission_percent-purchases.processing_fee-purchases.cc_fees-printed_fee,2)) AS to_show,
                                              SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                            ->where($where)
                            ->where(function($query) {
                                $query->where('purchases.status','=','Active')
                                      ->orWhere('purchases.status','like','Pending%');
                            })
                            ->groupBy('channel','method')->orderBy('channel','method')
                            ->get()->toArray();
                foreach ($summary_info as $d)
                {
                    $current = ['purchases'=>$d->purchases,'tickets'=>$d->tickets,'price_paid'=>$d->price_paid,'savings'=>$d->savings,'sales_taxes'=>$d->sales_taxes,
                                'cc_fees'=>$d->cc_fees,'to_show'=>$d->to_show,'commissions'=>$d->commissions,'fees_incl'=>$d->fees_incl,'fees_over'=>$d->fees_over,
                                'profit'=>$d->profit,'printed_fee'=>$d->printed_fee];
                    if($d->channel == 'Consignment')
                        $consignment = calc_totals([$consignment,$current]);
                    else
                    {
                        $summary_table[$d->channel.' - '.$d->method] = $current;
                        $subtotals = calc_totals([$subtotals,$current]);
                    }
                }
                $summary_table['Subtotals'] = $subtotals;
                $summary_table['Consignment'] = $consignment;
                $summary_table['Totals'] = calc_totals([$consignment,$subtotals]);
                return ['title'=>$title,'table'=>$summary_table];
            }
            for ($i=0;$i<=$search['mirror_period'];$i++)
                $summary[] = cal_summary($i,$where,$search,$search['mirror_type']);
            //remove conditios of date for the graph, to show 1 year ago
            $where = clear_date_sold($where);
            $start = date('Y-m-d', strtotime('-1 year'));
            $where[] = ['purchases.created','>=',$start];
            //info for the graph
            $graph = DB::table('purchases')
                    ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->join('users', 'users.id', '=' ,'purchases.user_id')
                    ->join('customers', 'customers.id', '=' ,'purchases.customer_id')
                    ->select(DB::raw('DATE_FORMAT(purchases.created,"%b %Y") AS purchased,
                                    SUM(purchases.quantity) AS qty,
                                    SUM(ROUND(purchases.commission_percent+purchases.processing_fee+purchases.printed_fee,2)) AS amount'))
                    ->where($where)
                    ->where(function($query) {
                        $query->where('purchases.status','=','Active')
                              ->orWhere('purchases.status','like','Pending%');
                    })
                    ->whereRaw(DB::raw('DATE_FORMAT(purchases.created,"%Y%m") >= '.$start))
                    ->groupBy(DB::raw('DATE_FORMAT(purchases.created,"%Y%m")'))->get()->toJson();  
            //return view
            return view('admin.dashboard.ticket_sales',compact('data','total','graph','summary','coupons','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Ticket Sales: '.$ex->getMessage());
        }
    }

    /**
     * Show the coupons report on the dashboard.
     *
     * @return view
     */
    public function coupons($info=null)
    {
        try {
            //init
            $input = Input::all();
            $data = $total = $graph = array();
            //conditions to search
            if(!empty($info))
                $data = $info;
            else
            {
                $data = Purchase::filter_options('REPORTS', $input, '-7');
                //enable only valid purchase status
                foreach ($data['search']['status'] as $k=>$v)
                    if($v!='Active' && !(strpos($v,'Pending')===0))
                        unset($data['search']['status'][$k]);
            }
            $where = $data['where'];
            $where[] = ['discounts.id','!=',1];
            $search = $data['search'];
            //get all records
            $data = DB::table('discounts')
                    ->leftJoin('purchases', 'discounts.id', '=' ,'purchases.discount_id')
                    ->leftJoin('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                    ->leftJoin('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->leftJoin('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->leftJoin('venues', 'venues.id', '=' ,'shows.venue_id')
                    ->select(DB::raw('COALESCE(shows.name,"-") AS show_name, COUNT(purchases.id) AS purchases,
                                    COALESCE(venues.name,"-") AS venue_name, discounts.code,
                                    discounts.distributed_at, discounts.description,discounts.start_date,discounts.end_date, purchases.id,
                                    COALESCE((SELECT SUM(pp.quantity) FROM purchases pp INNER JOIN show_times stt ON stt.id = pp.show_time_id
                                              WHERE stt.show_id = shows.id AND pp.discount_id = purchases.discount_id
                                              AND DATE(pp.created)>=DATE_SUB(CURDATE(),INTERVAL 1 DAY)),0) AS tickets_one,
                                    COALESCE((SELECT SUM(pp.quantity) FROM purchases pp INNER JOIN show_times stt ON stt.id = pp.show_time_id
                                              WHERE stt.show_id = shows.id AND pp.discount_id = purchases.discount_id
                                              AND DATE(pp.created)>=DATE_SUB(CURDATE(),INTERVAL 7 DAY)),0) AS tickets_seven,
                                    SUM(purchases.quantity) AS tickets, SUM(ROUND(purchases.printed_fee,2)) AS printed_fee,
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids,
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices,
                                    SUM(ROUND(purchases.price_paid,2)) AS revenue,
                                    SUM(ROUND(purchases.savings,2)) AS discounts,
                                    SUM(ROUND(purchases.cc_fees,2)) AS cc_fees,
                                    SUM(ROUND(purchases.printed_fee,2)) AS printed_fee,  
                                    SUM(ROUND(purchases.sales_taxes,2)) AS sales_taxes,
                                    SUM( IF(purchases.inclusive_fee>0, ROUND(purchases.processing_fee,2), 0) ) AS fees_incl,
                                    SUM( IF(purchases.inclusive_fee>0, 0, ROUND(purchases.processing_fee,2)) ) AS fees_over,
                                    SUM(ROUND(purchases.price_paid-purchases.processing_fee-purchases.commission_percent-purchases.cc_fees-purchases.printed_fee,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                    ->where($where)
                    ->where(function($query) {
                        $query->where('purchases.status','=','Active')
                              ->orWhere('purchases.status','like','Pending%')
                              ->orWhereNull('purchases.id');
                    })
                    ->groupBy('venues.id','shows.id','discounts.id')->orderBy('tickets','DESC')->orderBy('discounts.code','ASC')->orderBy('show_name','ASC');
            //conditions
            if(!empty($search['soldtime_start_date']) && !empty($search['soldtime_end_date']))
            {
                $data->where(DB::raw('DATE(discounts.end_date)'),'>=',date('Y-m-d',strtotime($search['soldtime_end_date'])));
                $data->where(function($query) use ($search) {
                    $query->where(DB::raw('DATE(purchases.created)'),'>=',date('Y-m-d',strtotime($search['soldtime_start_date'])))
                          ->orWhereNull('purchases.id');
                });
                $data->where(DB::raw('DATE(discounts.start_date)'),'<=',date('Y-m-d',strtotime($search['soldtime_start_date'])));
                $data->where(function($query) use ($search) {
                    $query->where(DB::raw('DATE(purchases.created)'),'<=',date('Y-m-d',strtotime($search['soldtime_end_date'])))
                          ->orWhereNull('purchases.id');
                });
            }
            $data = $data->get()->toArray();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'revenue'=>array_sum(array_column($data,'revenue')),
                            'printed_fee'=>array_sum(array_column($data,'printed_fee')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees_incl'=>array_sum(array_column($data,'fees_incl')),
                            'fees_over'=>array_sum(array_column($data,'fees_over')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'cc_fees'=>array_sum(array_column($data,'cc_fees')),
                            'sales_taxes'=>array_sum(array_column($data,'sales_taxes')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //descriptions
            $descriptions = [];
            foreach ($data as $d)
                if(!isset($descriptions[$d->code]))
                    $descriptions[$d->code] = $d->description;
            //return view
            if(!empty($info))
                return compact('data','total','descriptions');
            return view('admin.dashboard.coupons',compact('data','total','descriptions','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Coupons: '.$ex->getMessage());
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
            $data = Purchase::filter_options('REPORTS', $input, 0);
            //enable only valid purchase status
            foreach ($data['search']['status'] as $k=>$v)
                if($v!='Active' && !(strpos($v,'Pending')===0))
                    unset($data['search']['status'][$k]);
            $where = $data['where'];
            $where[] = ['show_times.show_time','>',$current];
            $search = $data['search'];
            //get all records
            $data = DB::table('purchases')
                        ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                        ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                        ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                        ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                        ->select(DB::raw('shows.id, shows.name, COUNT(purchases.id) AS purchases, venues.name AS venue_name,
                                    SUM(purchases.quantity) AS tickets,
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids,
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices,
                                    IF(purchases.inclusive_fee>0, 
                                        SUM(ROUND(purchases.retail_price-purchases.savings,2)), 
                                        SUM(ROUND(purchases.retail_price-purchases.savings+purchases.processing_fee,2)) ) AS revenue,
                                    SUM(ROUND(purchases.savings,2)) AS discounts,
                                    SUM(ROUND(purchases.cc_fees,2)) AS cc_fees,
                                    SUM(ROUND(purchases.printed_fee,2)) AS printed_fee,
                                    SUM(ROUND(purchases.sales_taxes,2)) AS sales_taxes,
                                    SUM( IF(purchases.inclusive_fee>0, ROUND(purchases.processing_fee,2), 0) ) AS fees_incl,
                                    SUM( IF(purchases.inclusive_fee>0, 0, ROUND(purchases.processing_fee,2)) ) AS fees_over,
                                    SUM(ROUND(purchases.price_paid-purchases.commission_percent-purchases.processing_fee-purchases.cc_fees-purchases.printed_fee,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions '))
                        ->where($where)
                        ->where(function($query) {
                            $query->where('purchases.status','=','Active')
                                  ->orWhere('purchases.status','like','Pending%');
                        })
                        ->orderBy('shows.name')->groupBy('shows.id')->get()->toArray();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'revenue'=>array_sum(array_column($data,'revenue')),
                            'printed_fee'=>array_sum(array_column($data,'printed_fee')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees_incl'=>array_sum(array_column($data,'fees_incl')),
                            'fees_over'=>array_sum(array_column($data,'fees_over')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'cc_fees'=>array_sum(array_column($data,'cc_fees')),
                            'sales_taxes'=>array_sum(array_column($data,'sales_taxes')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.future_liabilities',compact('data','total','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Future Liabilities: '.$ex->getMessage());
        }
    }

    /**
     * Show the Referrals report on the dashboard.
     *
     * @return view
     */
    public function channels()
    {
        try {
            //init
            $input = Input::all();
            $data = $total = array();
            //conditions to search
            $data = Purchase::filter_options('REPORTS', $input, '-30');
            //enable only valid purchase status
            foreach ($data['search']['status'] as $k=>$v)
                if($v!='Active' && !(strpos($v,'Pending')===0))
                    unset($data['search']['status'][$k]);
            $where = $data['where'];
            $search = $data['search'];
            //search arrange by order url or show
            if(isset($input) && isset($input['order']) && $input['order']=='channel')
            {
                $order = 'channel';
                $groupby = 'channel,show_name';
                $orderby = 'channel,show_name';
            }
            else
            {
                $order = 'show';
                $groupby = 'show_name,channel';
                $orderby = 'show_name,channel';
            }
            $search['order'] = $order;
            $data = DB::table('purchases')
                    ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->join('venues', 'venues.id', '=' ,'shows.venue_id')
                    ->select(DB::raw('shows.name AS show_name, COUNT(purchases.id) AS purchases, venues.name AS venue_name,
                                    purchases.channel,
                                    SUM(purchases.quantity) AS tickets,
                                    SUM(ROUND(purchases.price_paid,2)) AS price_paids,
                                    SUM(ROUND(purchases.retail_price,2)) AS retail_prices,
                                    IF(purchases.inclusive_fee>0, 
                                        SUM(ROUND(purchases.retail_price-purchases.savings,2)), 
                                        SUM(ROUND(purchases.retail_price-purchases.savings+purchases.processing_fee,2)) ) AS revenue,
                                    SUM(ROUND(purchases.savings,2)) AS discounts,
                                    SUM(ROUND(purchases.cc_fees,2)) AS cc_fees,
                                    SUM(ROUND(purchases.printed_fee,2)) AS printed_fee,  
                                    SUM(ROUND(purchases.sales_taxes,2)) AS sales_taxes,
                                    SUM( IF(purchases.inclusive_fee>0, ROUND(purchases.processing_fee,2), 0) ) AS fees_incl,
                                    SUM( IF(purchases.inclusive_fee>0, 0, ROUND(purchases.processing_fee,2)) ) AS fees_over,
                                    SUM(ROUND(purchases.price_paid-purchases.commission_percent-purchases.processing_fee-purchases.cc_fees-purchases.printed_fee,2)) AS to_show,
                                    SUM(ROUND(purchases.commission_percent,2)) AS commissions'))
                    ->where($where)
                    ->where(function($query) {
                        $query->where('purchases.status','=','Active')
                              ->orWhere('purchases.status','like','Pending%');
                    })
                    ->groupBy(DB::raw($groupby))->orderBy(DB::raw($orderby))->get()->toArray();
            //info for the graph
            if($order=='channel')
                $groupby = 'channel';
            else
                $groupby = 'shows.id';
            $graph['channel'] = DB::table('purchases')
                    ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->select(DB::raw('purchases.channel,
                                      SUM(purchases.processing_fee+purchases.commission_percent+purchases.printed_fee) AS amount'))
                    ->where($where)
                    ->groupBy('channel')->orderBy('amount','ASC')->distinct()->get()->toJson();
            $graph['show'] = DB::table('purchases')
                    ->join('tickets', 'tickets.id', '=' ,'purchases.ticket_id')
                    ->join('show_times', 'show_times.id', '=' ,'purchases.show_time_id')
                    ->join('shows', 'shows.id', '=' ,'show_times.show_id')
                    ->select(DB::raw('SUM(purchases.processing_fee+purchases.commission_percent+purchases.printed_fee) AS amount, shows.name AS show_name'))
                    ->where($where)
                    ->groupBy('show_name')->orderBy('amount','ASC')->distinct()->get()->toJson();
            //calculate totals
            $total = array( 'purchases'=>array_sum(array_column($data,'purchases')),
                            'tickets'=>array_sum(array_column($data,'tickets')),
                            'price_paids'=>array_sum(array_column($data,'price_paids')),
                            'retail_prices'=>array_sum(array_column($data,'retail_prices')),
                            'revenue'=>array_sum(array_column($data,'revenue')),
                            'printed_fee'=>array_sum(array_column($data,'printed_fee')),
                            'discounts'=>array_sum(array_column($data,'discounts')),
                            'fees_incl'=>array_sum(array_column($data,'fees_incl')),
                            'fees_over'=>array_sum(array_column($data,'fees_over')),
                            'to_show'=>array_sum(array_column($data,'to_show')),
                            'cc_fees'=>array_sum(array_column($data,'cc_fees')),
                            'sales_taxes'=>array_sum(array_column($data,'sales_taxes')),
                            'commissions'=>array_sum(array_column($data,'commissions')));
            //return view
            return view('admin.dashboard.channels',compact('data','total','graph','search'));
        } catch (Exception $ex) {
            throw new Exception('Error Dashboard Channels: '.$ex->getMessage());
        }
    }

}
