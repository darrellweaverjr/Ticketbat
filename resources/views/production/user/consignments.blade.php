@php $page_title='Consignments' @endphp
@extends('layouts.production')
@section('title')
  {!! $page_title !!}
@stop
@section('styles')
<!-- BEGIN PAGE LEVEL PLUGINS -->
<style>
    .input_total {
        background-color:black;
        color:greenyellow;
        font-weight:bold;
        font-size:16px;
        text-align:right;
    }
</style>
<!-- END PAGE LEVEL PLUGINS -->
@endsection

@section('content')

<div class="page-content color-panel" style="min-height:600px">
@if(empty($consignments) || !count($consignments))
<div>
    <center><br><h1>There are no consignments to list</h1></center>
</div>
@else
    <!-- BEGIN TABLE-->
    <div class="row fixed-panel">
        <div class="col-md-12">
            <div class="portlet box green">
                <div class="portlet-title">
                    <div class="caption">
                        <span class="caption-subject bold uppercase"> {{$page_title}} tickets </span>
                    </div>
                    <div class="actions">
                        <div class="btn-group">
                            <form method="post" action="/user/consignments" id="form_search_consignments">
                                <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                                <label>
                                    Hide voided consignments:<span></span>
                                    <input type="checkbox" @if(!empty($search['e_status'])) checked="true" @endif name="e_status" value="1"/>
                                </label>
                                <label>
                                    Hide past events:<span></span>
                                    <input type="checkbox" @if(!empty($search['a_status'])) checked="true" @endif name="a_status" value="1"/>
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="portlet-body flip-scroll">
                    <table class="table table-striped table-bordered table-hover table-header-fixed table-scrollable table-condensed flip-content" id="tb_consignments">
                        <thead class="flip-content">
                            <tr>
                                <th>#</th>
                                <th width="15%">Venue</th>
                                <th width="15%">Show</th>
                                <th>Event status</th>
                                <th>Show time</th>
                                <th>Ticket stock</th>
                                <th>Accounting status</th>
                                <th>Due date</th>
                                <th>Qty</th>
                                <th>Totals</th>
                                <th>Signed & Received</th>
                                <th>Check/purchase tickets</th>
                            </tr>
                        </thead>
                        <tbody style="text-align:center">
                            @foreach($consignments as $index=>$c)
                            <tr @if($c->a_status=='Voided') class="danger" @elseif(empty($c->signed)) class="warning" @endif>
                                <td>{{$index+1}}</td>
                                <td>{{$c->venue_name}}</td>
                                <td>{{$c->show_name}}</td>
                                <td>@if($c->e_status) Upcoming @else Passed @endif</td>
                                <td>{{date('m/d/Y',strtotime($c->show_time))}} - {{date('g:ia',strtotime($c->show_time))}}</td>
                                <td>@if($c->purchase || !$c->qty) TicketBat @else Other @endif</td>
                                <td>{{$c->a_status}}</td>
                                <td>{{date('m/d/Y',strtotime($c->due_date))}}</td>
                                <td>{{number_format($c->qty)}}</td>
                                <td style="text-align:right">${{number_format($c->total,2)}}</td>
                                @if(!empty($c->signed))
                                <td>{{date('m/d/Y g:ia',strtotime($c->signed))}}</td>
                                <td>
                                    <button type="button" class="btn btn-lg bg-green btn-outline" @if(!$c->active) disabled @endif data-id="{{$c->id}}"><i class="icon-docs"></i></button>
                                </td>
                                @else
                                <td>Pending</td>
                                <td>
                                    <button type="button" class="btn btn-lg bg-red btn-outline" @if(!$c->active) disabled @endif data-sign="{{$c->id}}"><i class="icon-arrow-down"></i></button>
                                </td>
                                @endif
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <!-- END EXAMPLE TABLE PORTLET-->
@endif
</div>
<!-- END TABLE -->
<!-- BEGIN SHARE TICKETS MODAL -->
<div id="modal_update_consignment" class="modal fade" tabindex="-1" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog" style="width:60% !important;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
                <h3 class="modal-title">Consignment tickets</h3>
            </div>
            <div class="modal-body" >
                <!-- BEGIN FORM-->
                <form method="post" id="form_update_consignment" class="form-horizontal">
                    <input type="hidden" name="consignment_id" value="">
                    <div class="row form-body portlet-body">
                        <div class="col-md-2">
                            <span class="label label-sm label-success"><b>Available</b></span>
                            <br><span id="summary_available"></span>
                        </div>
                        <div class="col-md-2">
                            <span class="label label-sm label-warning"><b>Sold</b></span>
                            <br><span id="summary_sold"></span>
                        </div>
                        <div class="col-md-2">
                            <span class="label label-sm label-danger"><b>Checked</b></span>
                            <br><span id="summary_checked"></span>
                        </div>
                        <div class="col-md-2">
                            <span class="label label-sm label-default"><b>Voided</b></span>
                            <br><span id="summary_voided"></span>
                        </div>
                        <div class="col-md-2">
                            <span class="label label-sm label-info"><b>Shopping cart</b></span>
                            <br><span id="summary_shoppingcart"></span>
                        </div>
                        <div class="col-md-2">
                            <input type="text" name="total_qty" class="input_total">
                            <input type="text" name="total_money" class="input_total">
                        </div>
                    </div>
                    <div class="form-body portlet-body flip-scroll" style="max-height:450px!important;overflow:auto;">
                        <table class="table table-striped table-bordered table-hover table-header-fixed table-scrollable table-condensed flip-content" >
                            <thead class="flip-content">
                                <tr class="uppercase">
                                    <th width="5%">#</th>
                                    <th width="20%">Section/Row</th>
                                    <th width="10%">Seat</th>
                                    <th width="15%">Retail price</th>
                                    <th width="15%">Fee</th>
                                    <th width="15%">Ticket price</th>
                                    <th width="15%">Status</th>
                                    <th width="5%">Check</th>
                                </tr>
                            </thead>
                            <tbody id="tb_update_consignment_body">
                            </tbody>
                        </table>
                    </div>
                </form>
                <!-- END FORM-->
            </div>
            <div class="modal-footer">
                <button type="button" data-dismiss="modal" class="btn dark btn-outline">Cancel</button>
                <button type="button" id="btn_update_consignment" class="btn bg-green btn-outline" title="Check the consignment tickets.">Purchase</button>
                <a href="/shoppingcart/viewcart" class="btn bg-info btn-outline">Shopping cart</a>
            </div>
        </div>
    </div>
</div>
<!-- END SHARE TICKETS MODAL -->
<!-- BEGIN SHARE CONFIRM MODAL -->
<div id="modal_confirm_consignment" class="modal fade" tabindex="-1" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog" style="width:600px!important;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
                <h3 class="modal-title">Confirm tickets</h3>
            </div>
            <div class="modal-body" id="confirm_body">
                <div class="row form-body portlet-body">
                    <div class="col-md-6">
                        <input type="text" name="total_qty" class="input_total">
                    </div>
                    <div class="col-md-6">
                        <input type="text" name="total_money" class="input_total">
                    </div>
                </div>
                <div class="form-body portlet-body flip-scroll" style="max-height:450px!important;overflow:auto;">
                    <table class="table table-striped table-bordered table-hover table-header-fixed table-scrollable table-condensed flip-content" >
                        <thead class="flip-content">
                            <tr class="uppercase">
                                <th width="10%">#</th>
                                <th width="40%">Section/Row</th>
                                <th width="30%">Seat</th>
                                <th width="20%">Price</th>
                            </tr>
                        </thead>
                        <tbody id="tb_confirm_consignment_body">
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="btn_confirm_cancel" class="btn dark btn-outline">Cancel</button>
                <button type="button" id="btn_confirm_consignment" class="btn bg-green btn-outline" title="Check the consignment tickets.">Confirm & return</button>
                <button type="button" id="btn_confirm_shoppingcart" class="btn bg-info btn-outline" title="Check the consignment tickets.">Confirm & pay</button>
            </div>
        </div>
    </div>
</div>
<!-- END SHARE CONFIRM MODAL -->
<!-- BEGIN SIGN MODAL -->
<div id="modal_sign_consignment" class="modal fade" tabindex="-1" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog" style="width:60% !important;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
                <h3 class="modal-title">Consignment pending to receive</h3>
            </div>
            <div class="modal-body" id="contract_agreement" style="padding-left:50px;padding-right:50px"></div>
            <div class="modal-footer">
                <button type="button" data-dismiss="modal" class="btn dark btn-outline">Cancel</button>
                <button type="button" id="btn_sign_consignment" data-id="" class="btn bg-green btn-outline" title="Sign the consignment contract.">I agree with the terms and sign the contract</button>
            </div>
        </div>
    </div>
</div>
<!-- END SIGN MODAL -->
@endsection

@section('scripts')
<script src="{{config('app.theme')}}js/bootstrap-touchspin.min.js" type="text/javascript"></script>
<script src="/js/production/user/consignments.js" type="text/javascript"></script>
@endsection
