@php $page_title='Completed' @endphp
@extends('layouts.production')
@section('title')
  {!! $page_title !!}
@stop
@section('styles')
<!-- BEGIN PAGE LEVEL PLUGINS -->
<!-- END PAGE LEVEL PLUGINS -->
@endsection

@section('content')

<!-- BEGIN TOP HEADER -->
<div class="page-content color-panel">  
<!--     BEGIN RECEIPTS -->
    <div class="row fixed-panel">
        <div class="portlet light about-text">
            <!-- BEGIN DESCRIPTION -->
            <h4 title="Items in the shopping cart.">
                <i class="fa fa-thumbs-up"></i> Thank you for purchasing tickets on TicketBat.com! 
            </h4>  
            <p class="margin-top-20">
            <center><a class="btn btn-danger btn-lg uppercase" href="/production/user/purchases/tickets/{{$purchases}}" target="_blank"><i class="fa fa-print icon-printer"></i> Print all tickets now!</a></center>
                @if(isset($send_welcome_email))
                    @if($send_welcome_email)
                    <div class="alert alert-success" style="margin:20px">
                        A welcome email has been sent to <strong>{{$sent_to}}</strong>. Please check your spam / junk folder for our emails.
                    </div>
                    @else
                    <div class="alert alert-danger" style="margin:20px">
                        A welcome email could not be sent to <strong>{{$sent_to}}</strong>. <button type="button" class="btn btn-danger" id="resend_welcome" >Click here to re-send <i class="fa fa-send"></i></button>
                    </div>
                    @endif
                @endif
                @if($sent_receipts)
                <div class="alert alert-success" style="margin:20px">
                    A receipt has been sent to <strong>{{$sent_to}}</strong>. Please check your spam / junk folder for our emails.
                </div>
                @else
                <div class="alert alert-danger" style="margin:20px">
                    The receipt could not be sent to <strong>{{$sent_to}}</strong>. <button type="button" class="btn btn-danger" id="resend_receipts" >Click here to re-send <i class="fa fa-send"></i></button>
                </div>
                @endif
                <hr>
                <center>
                    <h4><span style="color:#32c5d2"><b>Get Tickets Fast.</b></span> Download the <span style="color:#32c5d2"><b>Ticketbat App</b></span> and keep track of all your tickets on your phone.</h4><br>
                    <a href="https://itunes.apple.com/nz/app/ticketbat/id1176307768?mt=8" target="_blank" class="btn btn-outline sbold dark btn-lg"><i class="fa fa-apple"></i> Apple Store</a>
                    <a href="https://play.google.com/store/apps/details?id=com.ionicframework.ticketbatapp892952&hl=en" target="_blank" class="btn btn-outline sbold dark btn-lg"><i class="fa fa-google"></i> Google Play</a>
                </center><br>
            </p>
        </div>
    </div>
    <!-- END RECEIPTS -->
    @if(count($purchased))
    <!--     BEGIN PURCHASED -->
    <div class="row fixed-panel">
        <div class="portlet light about-text">
            <!-- BEGIN DESCRIPTION -->
            <h4 title="Items in the shopping cart.">
                <i class="fa fa-ticket"></i> You purchased
            </h4>  
            <p class="margin-top-20">
                @foreach($purchased as $p)
                <i style="padding-left:10px" class="fa fa-ticket"></i> <strong> {{$p['qty']}}</strong> @if($p['qty']>1) tickets @else ticket @endif for <strong>{{$p['event']}}</strong> on <strong>{{$p['schedule']}}</strong><br>
                @endforeach
                <br>
            </p>
        </div>
    </div>
    <!-- END PURCHASED -->
    @endif
</div>

@endsection

@section('scripts')
<script src="/js/production/shoppingcart/complete.js" type="text/javascript"></script>
@endsection