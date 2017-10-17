@php $page_title=$event->name.' at '.$event->venue @endphp
@extends('layouts.production')
@section('title')
  {!! $page_title !!}
@stop
@section('styles')
<!-- BEGIN PAGE LEVEL PLUGINS -->
<link href="{{env('IMAGE_URL_AMAZON_SERVER')}}/styles/ticket_types.css" rel="stylesheet" type="text/css" />
<!-- END PAGE LEVEL PLUGINS -->
@endsection

@section('content')

<!-- BEGIN NAME BAR-->
<div class="row widget-row">
    <div class="widget-thumb widget-bg-color-white text-uppercase" title="Name of the event">                
        <div class="widget-thumb-wrap text-center uppercase" style="font-size:44px">{{$event->name}}
        </div>
    </div>
</div>
<!-- END NAME BAR-->
<div class="page-content color-panel " style="padding-top: 30px"> 
    <div class="row fixed-panel">
        <div class="col-lg-6">
            <div class="portlet light about-text">
                <!-- BEGIN STAGE -->
                <h4>
                    <i class="fa fa-image"></i> Stage
                    <div class="actions pull-right">
                        <div class="btn-group">
                            <a data-toggle="dropdown"><i class="fa fa-share icon-share"></i></a>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="https://twitter.com/intent/tweet?text={{$event->name}} {{url()->current()}}" target="_blank">
                                        <i class="social-icon social-icon-color twitter"></i> Twitter
                                    </a></li>
                                <li><a href="https://plus.google.com/share?url={{url()->current()}}" target="_blank">
                                        <i class="social-icon social-icon-color googleplus"></i> Google+
                                    </a></li>
                                <li><a href="http://www.facebook.com/sharer/sharer.php?u={{url()->current()}}" target="_blank">
                                        <i class="social-icon social-icon-color facebook"></i> Facebook
                                    </a></li>
                            </ul>
                        </div>
                    </div>
                </h4> 
                <p class="margin-top-20">
                    <center>
                        <h4>{{$event->show_time}}</h4><hr>
                        <img src="{{$event->image_url}}" />
                    </center><br>
                </p>
                <!-- END STAGE -->
            </div>
        </div>
        <div class="col-lg-6">
            <form method="post" id="form_model_update" class="form-horizontal">
                <input name="show_time_id" type="hidden" value="{{$event->show_time_id}}"/>
                <input name="password" type="hidden" value=""/>
                <div class="portlet light about-text">
                    <h4>
                        <i class="fa fa-ticket"></i> Tickets
                    </h4> 
                    <div class="portlet-body">
                        <div class="panel-group accordion" id="tickets_accordion">
                            <!-- BEGIN TICKETS -->
                            @php $selected = true @endphp
                            @foreach($event->tickets as $index=>$t)
                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4 class="panel-title {{$t['class']}}">
                                        <a class="accordion-toggle accordion-toggle-styled @if(!$selected) collapsed @endif" data-toggle="collapse" data-parent="#tickets_accordion" href="#collapse_{{$index}}"> <b>{{$t['type']}}</b> </a>
                                    </h4>
                                </div>
                                <div id="collapse_{{$index}}" class="panel-collapse @if($selected) in @else collapse @endif">
                                    <div class="panel-body">
                                        @if(!empty($t['amex_only']))
                                        <div class="alert alert-danger display-block">
                                            <center>These tickets can only purchased with an American Express Card:</center>
                                        </div>
                                        @endif
                                        <div class="mt-radio-list">
                                            @foreach($t['tickets'] as $tt)
                                            <label class="mt-radio mt-radio-outline">
                                                <input type="radio" name="ticket_id" @if($selected) class="default_radio" @endif data-pass="{{$t['password']}}" data-price="{{$tt->retail_price}}" data-max="{{$tt->max_available}}" value="{{$tt->ticket_id}}" > 
                                                    @if($tt->retail_price>0)
                                                    ${{$tt->retail_price}} @if($tt->title!='None')- {{$tt->title}} @endif
                                                    @else
                                                    <b class="label label-sm sbold label-success">FREE  @if($tt->title!='None')- {{$tt->title}} @endif</b>
                                                    @endif
                                                <span></span>
                                            </label>
                                            @php $selected = false @endphp
                                            @endforeach
                                        </div>
                                    </div>
                                </div>
                            </div>                        
                            @endforeach
                            <!-- END TICKETS -->
                        </div>
                    </div>
                    <!-- BEGIN TOTALS -->
                    <p style="margin-top: 50px">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="control-label col-md-3">QTY</label>
                                <select class="form-control col-md-3" name="qty" data-price="" style="width:65px"></select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="control-label col-md-3 text-right">TOTAL</label>
                                <label id="totals" class="control-label col-md-6 text-center" style="font-size:22px">$ 0.00</label>
                            </div>
                        </div>
                    </p>
                    <!-- END TOTALS -->
                </div>
                <!-- BEGIN ADD TO -->
                <div class="portlet light about-text">
                    <!-- BEGIN DESCRIPTION -->
                    <div style="margin-top: 130px">
                        <a id="btn_add_shoppingcart" class="btn btn-danger btn-block btn-lg uppercase"><i class="fa fa-plus-square"></i> Add to cart</a>
                    </div>
                </div>
                <!-- END ADD TO -->
                <!-- BEGIN SHORTCUT FORM -->
                <div class="portlet light about-text" id="continue_buy_checkout_msg" style="display:none">
                    <div class="col-md-6">
                        <a href="/production/home" class="btn btn-info btn-block btn-lg uppercase"><i class="fa fa-suitcase"></i> Continue shopping </a>
                    </div>
                    <div class="col-md-6">
                        <a href="/production/shoppingcart" class="btn btn-success btn-block btn-lg uppercase"><i class="fa fa-shopping-cart"></i> Checkout </a>
                    </div>
                </div>
                <!-- END SHORTCUT FORM -->
            </form>
        </div>
    </div>
    <!-- END DESCRIPTION AND CALENDAR -->
</div>
@endsection

@section('scripts')
<script src="/js/production/events/buy.js" type="text/javascript"></script>
@endsection