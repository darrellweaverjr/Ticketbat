@php $page_title='Channels' @endphp
@extends('layouts.admin')
@section('title')
  {!! $page_title !!}
@stop
@section('styles')
<!-- BEGIN PAGE LEVEL PLUGINS -->
<!-- END PAGE LEVEL PLUGINS -->
@endsection

@section('content')

    <!-- BEGIN PAGE HEADER-->
    <!-- BEGIN PAGE TITLE-->
    <h1 class="page-title"> {{$page_title}}
        <small>statistics, charts and reports (by default the last 30 days).</small>
    </h1>
    <!-- END PAGE TITLE-->
    <!-- END PAGE HEADER-->
    <!-- BEGIN DASHBOARD STATS 1-->
    <div class="row" id="totals">
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
            <a class="dashboard-stat dashboard-stat-v2 dark">
                <div class="visual">
                    <i class="fa fa-ticket"></i>
                </div>
                <div class="details">
                    <div class="number">
                        <span data-counter="counterup" data-value="{{number_format($total['tickets'])}}">0</span>
                    </div>
                    <div class="desc">Tickets Sold
                        <br>Purchases: <span data-counter="counterup" data-value="{{number_format($total['purchases'])}}">0</span>
                    </div>
                </div>
            </a>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12" >
            <a class="dashboard-stat dashboard-stat-v2 green-seagreen">
                <div class="visual">
                    <i class="fa fa-bar-chart-o"></i>
                </div>
                <div class="details">
                    <div class="number">
                        $ <span data-counter="counterup" data-value="{{number_format($total['retail_prices']-$total['discounts']+$total['fees'],2)}}"></span></div>
                    <div class="desc">Total Revenue
                        @if(Auth::user()->user_type_id != 5)<br>Discounts: $ <span data-counter="counterup" data-value="{{number_format($total['discounts'],2)}}"></span>@endif
                    </div>
                </div>
            </a>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
            <a class="dashboard-stat dashboard-stat-v2 red">
                <div class="visual">
                    <i class="fa fa-money"></i>
                </div>
                <div class="details">
                    <div class="number">
                        $ <span data-counter="counterup" data-value="{{number_format($total['to_show'],2)}}"></span></div>
                    <div class="desc">To Show</div>
                </div>
            </a>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
            <a class="dashboard-stat dashboard-stat-v2 blue">
                <div class="visual">
                    <i class="fa fa-usd"></i>
                </div>
                <div class="details">
                    <div class="number">
                        $ <span data-counter="counterup" data-value="{{number_format($total['commissions'],2)}}"></span></div>
                    <div class="desc">
                        @if(Auth::user()->user_type_id != 5) Commission<br>Revenue @else TB Commission<br>Expense @endif
                    </div>
                </div>
            </a>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
            <a class="dashboard-stat dashboard-stat-v2 blue-steel">
                <div class="visual">
                    <i class="fa fa-globe"></i>
                </div>
                <div class="details">
                    <div class="number">
                        $ <span data-counter="counterup" data-value="{{number_format($total['fees'],2)}}"></span></div>
                    <div class="desc">Fee Revenue</div>
                </div>
            </a>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
            <a class="dashboard-stat dashboard-stat-v2 purple">
                <div class="visual">
                    <i class="fa fa-shopping-cart"></i>
                </div>
                <div class="details">
                    <div class="number">
                        $ <span data-counter="counterup" data-value="{{number_format($total['commissions']+$total['fees'],2)}}"></span>
                    </div>
                    <div class="desc">
                        @if(Auth::user()->user_type_id != 5) Gross Profit @else TB Retains @endif
                    </div>
                </div>
            </a>
        </div>
    </div>
    <!-- END DASHBOARD STATS 1-->
    <div class="row">
       <div class="col-md-6">
           <div class="portlet light portlet-fit bordered">
               <div class="portlet-body responsive">
                   <div id="chart_channel"  data-info="{{$graph['channel']}}" class="chart" style="height:250px;"></div>
               </div>
           </div>
       </div>
       <div class="col-md-6">
           <div class="portlet light portlet-fit bordered">
               <div class="portlet-body responsive">
                   <div id="chart_show"  data-info="{{$graph['show']}}" class="chart" style="height:250px;"></div>
               </div>
           </div>
       </div>
   </div>
    <!-- BEGIN EXAMPLE TABLE PORTLET-->
    <div class="row">
        <div class="col-md-12">
            <div class="portlet box green">
                <div class="portlet-title">
                    <div class="caption">
                        <i></i>{{strtoupper($page_title)}}</div>
                    <div class="tools"> </div>
                </div>
                <div class="portlet-body">
                    <table class="table table-striped table-bordered table-hover" id="tb_model">
                        <thead>
                            <tr>
                                @if($search['order']=='channel')
                                <th style="text-align:center">Venue</th>
                                <th style="text-align:center">Show</th>
                                <th style="text-align:center">Channel</th>
                                @else
                                <th style="text-align:center">Channel</th>
                                <th style="text-align:center">Venue</th>
                                <th style="text-align:center">Show</th>
                                @endif
                                <th style="text-align:center">Qty<br>Sold</th>
                                <th style="text-align:center">Purch.</th>
                                <th style="text-align:center">Total<br>Revenue</th>
                                @if(Auth::user()->user_type_id != 5)
                                <th style="text-align:center">Discounts</th>
                                @endif
                                <th style="text-align:center">To<br>Show</th>
                                <th style="text-align:center">@if(Auth::user()->user_type_id != 5) Commiss. @else TB Comm.<br>Expense @endif</th>
                                <th style="text-align:center">P.Fees</th>
                                <th style="text-align:center">@if(Auth::user()->user_type_id != 5) Gross<br>Profit @else TB Retains @endif</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($data as $d)
                            <tr>
                                @if($search['order']=='channel')
                                <td>{{$d->venue_name}}</td>
                                <td>{{$d->show_name}}</td>
                                <td>{{$d->channel}}</td>
                                @else
                                <td>{{$d->channel}}</td>
                                <td>{{$d->venue_name}}</td>
                                <td>{{$d->show_name}}</td>
                                @endif
                                <td style="text-align:center">{{number_format($d->tickets)}}</td>
                                <td style="text-align:center">{{number_format($d->purchases)}}</td>
                                <td style="text-align:right">$ {{number_format($d->revenue,2)}}</td>
                                @if(Auth::user()->user_type_id != 5)
                                <td style="text-align:right">$ {{number_format($d->discounts,2)}}</td>
                                @endif
                                <td style="text-align:right">$ {{number_format($d->to_show,2)}}</td>
                                <td style="text-align:right">$ {{number_format($d->commissions,2)}}</td>
                                <td style="text-align:right">$ {{number_format($d->fees,2)}}</td>
                                <td style="text-align:right"><b>$ {{number_format($d->commissions+$d->fees,2)}}</b></td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <!-- END EXAMPLE TABLE PORTLET-->
    <!-- BEGIN SEARCH MODAL-->
    <div id="modal_model_search" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:570px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Filter Panel</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" action="/admin/dashboard/referrals" id="form_model_search">
                        <input type="hidden" name="_token" value="{{ Session::token() }}" />
                        <div class="form-body">
                            <div class="row">
                                <div class="form-group">
                                    <label class="control-label col-md-3">Venue:</label>
                                    <div class="col-md-9 show-error">
                                        <div class="input-group">
                                            <select class="form-control" name="venue" style="width: 397px !important">
                                                <option selected value="">All</option>
                                                @foreach($search['venues'] as $index=>$v)
                                                <option @if($v->id==$search['venue']) selected @endif value="{{$v->id}}">{{$v->name}}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Show:</label>
                                    <div class="col-md-9 show-error">
                                        <div class="input-group">
                                            <select class="form-control" name="show" style="width: 397px !important" data-content='@php echo str_replace("'"," ",json_encode($search["shows"]));@endphp'>
                                                <option selected value="">All</option>
                                                @foreach($search['shows'] as $index=>$s)
                                                    @if($s->venue_id == $search['venue'])
                                                    <option @if($s->id==$search['show']) selected @endif value="{{$s->id}}">{{$s->name}}</option>
                                                    @endif
                                                @endforeach
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Show Time:</label>
                                    <div class="col-md-9 show-error">
                                        <div class="input-group" id="show_times_date">
                                            <input type="text" class="form-control" name="showtime_start_date" value="{{$search['showtime_start_date']}}" readonly="true">
                                            <span class="input-group-addon"> to </span>
                                            <input type="text" class="form-control" name="showtime_end_date" value="{{$search['showtime_end_date']}}" readonly="true">
                                            <span class="input-group-btn">
                                                <button class="btn default date-range-toggle" type="button">
                                                    <i class="fa fa-calendar"></i>
                                                </button>
                                                <button class="btn default" type="button" id="clear_show_times_date">
                                                    <i class="fa fa-remove"></i>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Sold Date:</label>
                                    <div class="col-md-9 show-error">
                                        <div class="input-group" id="sold_times_date">
                                            <input type="text" class="form-control" name="soldtime_start_date" value="{{$search['soldtime_start_date']}}" readonly="true">
                                            <span class="input-group-addon"> to </span>
                                            <input type="text" class="form-control" name="soldtime_end_date" value="{{$search['soldtime_end_date']}}" readonly="true">
                                            <span class="input-group-btn">
                                                <button class="btn default date-range-toggle" type="button">
                                                    <i class="fa fa-calendar"></i>
                                                </button>
                                                <button class="btn default" type="button" id="clear_sold_times_date">
                                                    <i class="fa fa-remove"></i>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Order:</label>
                                    <div class="col-md-9 show-error">
                                        <div class="input-group">
                                            <select class="form-control" name="order" style="width: 321px !important">
                                                <option selected value="channel">Channel</option>
                                                <option @if($search['order']=='show') selected @endif value="show">Show</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                    <button type="submit" class="btn sbold grey-salsa">Search</button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END SEARCH MODAL-->
@endsection

@section('scripts')
<script src="{{config('app.theme')}}js/bootstrap-datepicker.min.js" type="text/javascript"></script>
<script src="{{config('app.theme')}}js/amcharts.js" type="text/javascript"></script>
<script src="{{config('app.theme')}}js/pie.js" type="text/javascript"></script>
<script src="/js/admin/dashboard/channels.js" type="text/javascript"></script>
@endsection