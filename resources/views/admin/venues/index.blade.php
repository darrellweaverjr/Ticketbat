@php $page_title='Venues' @endphp
@extends('layouts.admin')
@section('title', 'Venues' )

@section('styles') 
<!-- BEGIN PAGE LEVEL PLUGINS -->
<link href="/themes/admin/assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css" rel="stylesheet" type="text/css" />
<link href="/themes/admin/assets/global/plugins/fullcalendar/fullcalendar.min.css" rel="stylesheet" type="text/css" />
<link href="/themes/admin/assets/global/plugins/clockface/css/clockface.css" rel="stylesheet" type="text/css" />
<link href="/themes/admin/assets/global/plugins/cubeportfolio/css/cubeportfolio.css" rel="stylesheet" type="text/css" />
<!-- END PAGE LEVEL PLUGINS -->
@endsection

@section('content') 
    <!-- BEGIN PAGE HEADER-->   
    <!-- BEGIN PAGE TITLE-->
    <h1 class="page-title"> {{$page_title}} 
        <small> - List, add, edit and remove venues.</small>
    </h1>
    <!-- END PAGE TITLE-->    
    <!-- BEGIN EXAMPLE TABLE PORTLET-->
    <div class="row">
        <div class="col-md-12">
            <div class="portlet box green">
                <div class="portlet-title">
                    <div class="caption">
                        <span class="caption-subject bold uppercase"> {{strtoupper($page_title)}} LIST </span>
                    </div>
                    <div class="actions">
                        <div class="btn-group">
                            <button id="btn_model_search" class="btn sbold grey-salsa" data-toggle="modal" data-target="#modal_model_search"> Search 
                                <i class="fa fa-search"></i>
                            </button>
                            <button id="btn_model_add" class="btn sbold bg-green" disabled="true"> Add 
                                <i class="fa fa-plus"></i>
                            </button>
                            <button id="btn_model_edit" class="btn sbold bg-yellow" disabled="true"> Edit 
                                <i class="fa fa-edit"></i>
                            </button>
                            <button id="btn_model_remove" class="btn sbold bg-red" disabled="true"> Remove 
                                <i class="fa fa-remove"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="portlet-body">
                    <table class="table table-striped table-bordered table-hover table-checkable" id="tb_model">
                        <thead>
                            <tr>
                                <th width="2%">
                                    <label class="mt-checkbox mt-checkbox-single mt-checkbox-outline">
                                        <input type="checkbox" class="group-checkable" data-set="#tb_model .checkboxes" />
                                        <span></span>
                                    </label>
                                </th>
                                <th width="95%"> Name </th>
                                <th width="5%"> Featured </th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($venues as $index=>$v)
                            <tr>
                                <td width="2%">
                                    <label class="mt-checkbox mt-checkbox-single mt-checkbox-outline">
                                        <input type="checkbox" class="checkboxes" id="{{$v->id}}" value="{{$v->name}}" />
                                        <span></span>
                                    </label>
                                </td>
                                <td class="search-item clearfix" width="95%"> 
                                    <div class="search-content col-md-3"> 
                                        @if(preg_match('/\/uploads\//',$v->image_url)) @php $v->image_url = env('IMAGE_URL_OLDTB_SERVER').$v->image_url @endphp @endif
                                        @if(preg_match('/\/s3\//',$v->image_url)) @php $v->image_url = env('IMAGE_URL_AMAZON_SERVER').str_replace('/s3/','/',$v->image_url) @endphp @endif
                                        <center style="color:red;"><i><b><a data-toggle="modal" href="#modal_details_{{$v->id}}"><img alt="- No image -" height="100px" width="200px" src="{{$v->image_url}}"/></a></b></i></center>
                                    </div>
                                    <div class="search-content col-md-9">
                                        <h4 class="search-title"><b><a data-toggle="modal" href="#modal_details_{{$v->id}}">{{$v->name}}</a></b> [<a href="https://www.ticketbat.com/venue/{{$v->slug}}" target="_blank">{{$v->slug}}</a>]</h4>
                                        <small><i>
                                            Location: <a>{{$v->address}}, {{$v->city}}, {{$v->state}}, {{$v->country}} {{$v->zip}}</a>
                                        </i></small><br>
                                        <small><i>
                                            @if($v->googleplus)Google+: <a href="{{$v->googleplus}}" target="_blank">{{$v->googleplus}} </a>@endif
                                            @if($v->youtube)YouTube: <a href="{{$v->youtube}}" target="_blank">{{$v->youtube}} </a>@endif 
                                            @if($v->facebook)Facebook: <a href="{{$v->facebook}}" target="_blank">{{$v->facebook}} </a>@endif 
                                            @if($v->twitter)Twitter: <a href="{{$v->twitter}}" target="_blank">{{$v->twitter}} </a>@endif 
                                            @if($v->yelpbadge)YelpBadge: <a href="{{$v->yelpbadge}}" target="_blank">{{$v->yelpbadge}} </a>@endif 
                                            @if($v->instagram)Instagram: <a href="{{$v->instagram}}" target="_blank">{{$v->instagram}} </a>@endif 
                                        </i></small><br>
                                        @if($v->description) {{$v->description}} @else <i style="color:red"><b>- No description -</b></i> @endif 
                                    </div>
                                </td>
                                <td width="5%"><center> <span class="label label-sm sbold
                                    @if($v->is_featured) label-success"> Yes 
                                    @else label-danger"> No 
                                    @endif
                                    </center></span> 
                                </td>
                            </tr>
                            <!-- BEGIN DETAILS MODAL--> 
                            <!--{{-- 
                            <div id="modal_details_{{$v->id}}" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
                                <div class="modal-dialog">
                                    <div class="modal-content portlet">
                                        <div id="modal_model_update_header" class="modal-header">
                                            <h4 class="modal-title bold uppercase"><center>{{$v->name}}</center></h4>
                                        </div>
                                        <div class="modal-body">
                                            <div class="portlet light ">
                                                <div class="portlet-title">
                                                    <center style="color:red;"><i><b><img alt="- No image -" height="200px" width="500px" src="{{$v->image_url}}"/></b></i></center>
                                                </div>
                                                <div class="portlet-body">
                                                    <ul class="chats">
                                                        <li class="in">
                                                            <div class="avatar">Slug</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> <a href="https://www.ticketbat.com/event/{{$v->slug}}" target="_blank">{{$v->slug}}</a> </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Location</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> 
                                                                    Venue: <b>{{$v->venue_name}}</b><br>
                                                                    Stage: <b>{{$v->stage_name}}</b><br>
                                                                    Restrictions: <b>{{$v->restrictions}}</b>
                                                                </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Category</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> {{$v->category}} </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Social Media</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> 
                                                                    @if($v->url)Web Site: <a href="{{$v->url}}" target="_blank">{{$v->url}} </a>@endif
                                                                    @if($v->googleplus)Google+: <a href="{{$v->googleplus}}" target="_blank">{{$v->googleplus}} </a>@endif
                                                                    @if($v->youtube)YouTube: <a href="{{$v->youtube}}" target="_blank">{{$v->youtube}} </a>@endif 
                                                                    @if($v->facebook)Facebook: <a href="{{$v->facebook}}" target="_blank">{{$v->facebook}} </a>@endif 
                                                                    @if($v->twitter)Twitter: <a href="{{$v->twitter}}" target="_blank">{{$v->twitter}} </a>@endif 
                                                                    @if($v->yelpbadge)MySpace: <a href="{{$v->yelpbadge}}" target="_blank">{{$v->yelpbadge}} </a>@endif 
                                                                    @if($v->instagram)Instagram: <a href="{{$v->instagram}}" target="_blank">{{$v->instagram}} </a>@endif 
                                                                    @if(!$v->url && !$v->googleplus && !$v->youtube && !$v->facebook && !$v->twitter && !$v->yelpbadge && !$v->instagram) <i style="color:red"><b>- No social media links -</b></i> @endif
                                                                </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Sponsorship</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> 
                                                                    @if($v->sponsor)Sponsor: <b>{{$v->sponsor}}</b> <br>@endif
                                                                    @if($v->presented_by)Presented By: <b>{{$v->presented_by}}</b>@endif
                                                                    @if(!$v->sponsor && !$v->presented_by && !$v->sponsor_logo_id) <i style="color:red"><b>- No sponsorship -</b></i> @endif
                                                                </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Feature</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> 
                                                                    Featured?: <b>@if($v->is_featured) Yes @else No @endif</b><br>
                                                                    Active?: <b>@if($v->is_active) Yes @else No @endif</b><br>
                                                                    Enable print tickets?: <b>@if($v->printed_tickets) Yes @else No @endif</b><br>
                                                                    On Sale: <b>@if($v->on_sale && $v->on_sale!='0000-00-00 00:00:00') {{date('m/d/Y g:ia',strtotime($v->on_sale))}} @else - @endif</b><br>
                                                                </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Short Description</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> @if($v->short_description) {{$v->short_description}} @else <i style="color:red"><b>- No short description -</b></i> @endif </span>
                                                            </div>
                                                        </li>
                                                        <li class="in">
                                                            <div class="avatar">Full Description</div>
                                                            <div class="message">
                                                                <span class="arrow"> </span>
                                                                <span class="body"> @if($v->description) {{$v->description}} @else <i style="color:red"><b>- No description -</b></i> @endif </span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div> 
                                            </div>
                                            <div class="row">
                                                <div class="modal-footer">
                                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> --}}-->
                            <!-- END DETAILS MODAL--> 
                            @endforeach 
                        </tbody>
                    </table>
                </div>
            </div>            
        </div>
    </div>
    <!-- END EXAMPLE TABLE PORTLET-->   
    <!-- BEGIN UPDATE MODAL--> 
    <div id="modal_model_update" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:1000px !important;">
            <div class="modal-content portlet">
                <div id="modal_model_update_header" class="modal-header alert-block bg-green">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center id="modal_model_update_title"></center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" id="form_model_update" class="form-horizontal">
                        <input name="id" type="hidden" value=""/>
                        <div class="form-body">
                            <div class="alert alert-danger display-hide">
                                <button class="close" data-close="alert"></button> You have some form errors. Please check below. </div>
                            <div class="alert alert-success display-hide">
                                <button class="close" data-close="alert"></button> Your form validation is successful! </div>                             
                            <div class="tabbable-line">
                                <ul class="nav nav-tabs">
                                    <li class="active">
                                        <a href="#tab_model_update_general" data-toggle="tab" aria-expanded="false"> General </a>
                                    </li>
                                    <li class="">
                                        <a href="#tab_model_update_location" data-toggle="tab" aria-expanded="true"> Location </a>
                                    </li>
                                    <li class="">
                                        <a href="#tab_model_update_reports" data-toggle="tab" aria-expanded="true"> Reports </a>
                                    </li>
                                    <li class="">
                                        <a href="#tab_model_update_bands" data-toggle="tab" aria-expanded="false"> Stages </a>
                                    </li>
                                    <li class="dropdown">
                                        <a href="#tab_model_update_multimedia" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false"> Multimedia
                                            <i class="fa fa-angle-down"></i>
                                        </a>
                                        <ul class="dropdown-menu pull-right">
                                            <li class="">
                                                <a href="#tab_model_update_images" data-toggle="tab"> Images </a>
                                            </li>
                                            <li class="">
                                                <a href="#tab_model_update_banners" data-toggle="tab"> Banners </a>
                                            </li>
                                            <li class="">
                                                <a href="#tab_model_update_videos" data-toggle="tab"> Videos </a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane active" id="tab_model_update_general">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label class="control-label">
                                                    <span class="required"> General </span>
                                                </label><hr>
                                                <div class="form-group">
                                                    <label class="control-label col-md-3">Name
                                                        <span class="required"> * </span>
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="name" class="form-control" placeholder="My Venue" /> 
                                                    </div>
                                                    <label class="control-label col-md-3">Slug
                                                        <span class="required"> * </span>
                                                    </label>
                                                    <div class="col-md-6 show-error">
                                                        <input type="text" name="slug" class="form-control" readonly="true" /> 
                                                    </div>
                                                    <div class="col-md-3 show-error">
                                                        <button class="btn btn-block" id="go_to_slug" type="button">Go to
                                                            <i class="fa fa-link"></i>
                                                        </button>
                                                    </div>
                                                    <label class="control-label col-md-3">Restriction
                                                        <span class="required"> * </span>
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <select class="form-control" name="restrictions">
                                                            @foreach($restrictions as $index=>$r)
                                                            <option selected value="{{$r}}">{{$r}}</option>
                                                            @endforeach
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <label class="control-label col-md-3">Featured</label>
                                                    <div class="col-md-2">
                                                        <input type="hidden" name="is_featured" value="0"/>
                                                        <input type="checkbox" class="make-switch" name="is_featured" data-size="small" value="100" data-on-text="ON" data-off-text="OFF" data-on-color="primary" data-off-color="danger">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="control-label">
                                                    <span class="required"> Social Media & Others </span>
                                                </label><hr>
                                                <div class="form-group">
                                                    <label class="col-md-3 control-label">Youtube
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="youtube" class="form-control" placeholder="https://www.youtube.com/user/myshow" /> 
                                                    </div>
                                                    <label class="col-md-3 control-label">Facebook
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="facebook" class="form-control" placeholder="https://www.facebook.com/myshow" /> 
                                                    </div>
                                                    <label class="col-md-3 control-label">Twitter
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="twitter" class="form-control" placeholder="https://twitter.com/myshow" /> 
                                                    </div>
                                                    <label class="col-md-3 control-label">Google+
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="googleplus" class="form-control" placeholder="https://googleplus.com/myshow" /> 
                                                    </div>
                                                    <label class="col-md-3 control-label">YelpBadge
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="yelpbadge" class="form-control" placeholder="https://yelpbadge.com/myshow" /> 
                                                    </div>
                                                    <label class="col-md-3 control-label">Instagram
                                                    </label>
                                                    <div class="col-md-9 show-error">
                                                        <input type="text" name="instagram" class="form-control" placeholder="https://www.instagram.com/myshow" /> 
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <label class="control-label">
                                            <span class="required"> Others </span>
                                        </label><hr>
                                        <div class="row">
                                            <label class="col-md-2 control-label">Ticket Info
                                                <span class="required"> * </span>
                                            </label>
                                            <div class="col-md-10 show-error">
                                                <textarea name="ticket_info" class="form-control" rows="2"></textarea>
                                            </div> 
                                        </div>
                                        <div class="row">
                                            <label class="col-md-2 control-label">Description</label>
                                            <div class="col-md-10 show-error">
                                                <textarea name="description" class="form-control" rows="5"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_location">
                                        <div class="row">
                                            <div class="form-group">
                                                <label class="control-label col-md-2">Address
                                                    <span class="required"> * </span>
                                                </label>
                                                <div class="col-md-8 show-error">
                                                    <input type="text" name="street" class="form-control" placeholder="000 Main St" /> 
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="form-group">
                                                <label class="control-label col-md-2">City
                                                    <span class="required"> * </span>
                                                </label>
                                                <div class="col-md-3 show-error">
                                                    <input type="text" name="city" class="form-control" placeholder="Las Vegas" /> 
                                                </div>
                                                <label class="control-label col-md-1">State
                                                    <span class="required"> * </span>
                                                </label>
                                                <div class="col-md-1 show-error">
                                                    <input type="text" name="state" class="form-control" placeholder="NV" /> 
                                                </div>
                                                <label class="control-label col-md-1">Zip
                                                    <span class="required"> * </span>
                                                </label>
                                                <div class="col-md-2 show-error">
                                                    <input type="text" name="zip" class="form-control" placeholder="00000" onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 0 " /> 
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_reports">
                                        <div class="row">
                                            <div class="col-md-5">
                                                <div class="form-group">
                                                    <label class="control-label" style="padding-left:30px">Email for Weekly Sales Reports:
                                                    </label>
                                                    <div class="show-error" style="padding-left:30px">
                                                        <input type="text" name="weekly_email" class="form-control" placeholder="abc@ticketbat.com,def@redmercuryent.com" /> 
                                                    </div>
                                                    <label class="control-label" style="padding-left:30px">Email for Accounting: 
                                                    </label>
                                                    <div class="show-error" style="padding-left:30px">
                                                        <input type="text" name="accounting_email" class="form-control" placeholder="abc@ticketbat.com,def@redmercuryent.com" /> 
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-7">
                                                <label class="control-label col-md-9">Send weekly sales emails</label>
                                                <div class="col-md-3">
                                                    <input type="hidden" name="weekly_sales_emails" value="0"/>
                                                    <input type="checkbox" class="make-switch" name="weekly_sales_emails" data-size="small" value="1" data-on-text="ON" data-off-text="OFF" data-on-color="primary" data-off-color="danger">
                                                </div>
                                                <label class="control-label col-md-9">Send daily sales emails</label>
                                                <div class="col-md-3">
                                                    <input type="hidden" name="daily_sales_emails" value="0"/>
                                                    <input type="checkbox" class="make-switch" name="daily_sales_emails" data-size="small" value="1" data-on-text="ON" data-off-text="OFF" data-on-color="primary" data-off-color="danger">
                                                </div>
                                                <label class="control-label col-md-9">Send financial report emails</label>
                                                <div class="col-md-3">
                                                    <input type="hidden" name="financial_report_emails" value="0"/>
                                                    <input type="checkbox" class="make-switch" name="financial_report_emails" data-size="small" value="1" data-on-text="ON" data-off-text="OFF" data-on-color="primary" data-off-color="danger">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_stages">
                                        <div class="btn-group">
                                            <button type="button" id="btn_model_stage_add" class="btn sbold bg-green"> Add 
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="row table-responsive" style="padding:20px;max-height:400px;overflow-y: auto;">
                                            <table class="table table-striped table-hover table-bordered" >
                                                <thead>
                                                    <tr>
                                                        <th> Name </th>
                                                        <th> Description </th>
                                                        <th> Image </th>
                                                        <th> </th>
                                                        <th> </th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tb_venue_stages">
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_images">
                                        <div class="btn-group" style="padding-bottom:20px;">
                                            <button type="button" id="btn_model_image_add" class="btn sbold bg-green"> Add 
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="row" style="max-height:600px !important;overflow-y: auto;">
                                            <div id="grid_venue_images" class="cbp" style="min-height: 2000px; width:950px !important;"></div>
                                        </div>   
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_banners">
                                        <div class="btn-group" style="padding-bottom:20px;">
                                            <button type="button" id="btn_model_banner_add" class="btn sbold bg-green"> Add 
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="row" style="max-height:600px !important;overflow-y: auto;">
                                            <div id="grid_venue_banners" class="cbp" style="min-height: 2000px; width:950px !important;"></div>
                                        </div>   
                                    </div>
                                    <div class="tab-pane" id="tab_model_update_videos">
                                        <div class="btn-group" style="padding-bottom:20px;">
                                            <button type="button" id="btn_model_video_add" class="btn sbold bg-green"> Add 
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="row" style="max-height:600px !important;overflow-y: auto;">
                                            <div id="grid_venue_videos" class="cbp" style="min-height: 2000px; width:950px !important;"></div>
                                        </div>   
                                    </div>
                                </div>
                            </div> 
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                    <button type="button" id="btn_model_save" class="btn sbold bg-green">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END UPDATE MODAL--> 
    <!-- BEGIN SEARCH MODAL--> 
    <div id="modal_model_search" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:400px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Search Panel</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" action="/admin/shows" id="form_model_search">
                        <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                        <div class="form-body">
                            <div class="row">
                                <div class="form-group">
                                    <label for="onlyerrors" class="col-md-5"> <span>Only With Error:</span> </label>
                                    <select class="table-group-action-input form-control input-inline input-small input-sm col-md-7" name="onlyerrors" style="width:65px !important">
                                        <option @if($onlyerrors==0) selected @endif value="0">No</option>
                                        <option @if($onlyerrors==1) selected @endif value="1">Yes</option>
                                    </select>
                                </div>   
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline" onclick="$('#form_model_search').trigger('reset')">Cancel</button>
                                    <button type="submit" class="btn sbold grey-salsa" onclick="$('#modal_model_search').modal('hide'); swal({
                                                                                                    title: 'Searching information',
                                                                                                    text: 'Please, wait.',
                                                                                                    type: 'info',
                                                                                                    showConfirmButton: false
                                                                                                });" >Search</button>
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
    <!-- BEGIN ADD/EDIT STAGES MODAL--> 
    <div id="modal_model_venue_stages" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:500px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Add/Edit Stage</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" id="form_model_venue_stage">
                        <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                        <input type="hidden" name="venue_id" value="" />
                        <input type="hidden" name="id" value="" />
                        <div class="form-body">
                            <div class="row">
                                
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline" onclick="$('#form_model_venue_stages').trigger('reset')">Cancel</button>
                                    <button type="button" id="submit_model_venue_stages" class="btn sbold grey-salsa">Save</button>
                                </div>
                            </div>
                        </div>
                    </form> 
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END ADD/EDIT STAGES MODAL--> 
    <!-- BEGIN ADD/REMOVE VENUEIMAGES MODAL--> 
    <div id="modal_model_venue_images" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:500px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Image</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" id="form_model_venue_images">
                        <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                        <input type="hidden" name="id" value="" />
                        <input type="hidden" name="venue_id" value="" />
                        <input type="hidden" name="action" value="" />
                        <div class="form-body">
                            <div class="row">
                                <div class="form-group">
                                    <label class="control-label col-md-3">Type
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                        <select class="form-control" name="image_type">
                                            @foreach($image_types as $index=>$it)
                                                <option value="{{$index}}">{{$it}}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Caption
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                        <input type="text" class="form-control" name="caption" value=""/>
                                    </div>
                                </div>
                                <div class="form-group" id="subform_venue_images">
                                    <label class="control-label col-md-3">Image
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error" >
                                        <center>
                                            <input type="hidden" name="url"/>
                                            <button type="button" id="btn_upload_image_url" class="btn btn-block sbold dark btn-outline" >Upload New Image</button>
                                            <img name="url" alt="- No image -" src="" width="323px" height="270px" />
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                    <button type="button" id="submit_model_venue_images" class="btn sbold grey-salsa">Save</button>
                                </div>
                            </div>
                        </div>
                    </form> 
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END ADD/REMOVE VENUEIMAGES MODAL--> 
    <!-- BEGIN ADD/REMOVE VENUEBANNERS MODAL--> 
    <div id="modal_model_venue_banners" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:500px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Banner</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" id="form_model_venue_banners">
                        <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                        <input type="hidden" name="id" value="" />
                        <input type="hidden" name="parent_id" value="" />
                        <input type="hidden" name="action" value="" />
                        <div class="form-body">
                            <div class="row">
                                <div class="form-group">
                                    <label class="control-label col-md-3">Showed on
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                    @foreach($banner_types as $index=>$bt)
                                        <label class="mt-checkbox"><input type="checkbox" name="type[]" value="{{$index}}"/>{{$bt}}<span></span></label><br>
                                    @endforeach
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label col-md-3">Link to
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                        <input type="text" class="form-control" name="url" value=""/>
                                    </div>
                                </div>
                                <div class="form-group" id="subform_venue_banners">
                                    <label class="control-label col-md-3">Image
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error" >
                                        <center>
                                            <input type="hidden" name="file"/>
                                            <button type="button" id="btn_upload_image_banner" class="btn btn-block sbold dark btn-outline" >Upload New Image</button>
                                            <img name="file" alt="- No image -" src="" width="323px" height="270px" />
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                    <button type="button" id="submit_model_venue_banners" class="btn sbold grey-salsa">Save</button>
                                </div>
                            </div>
                        </div>
                    </form> 
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END ADD/REMOVE VENUEBANNERS MODAL--> 
    <!-- BEGIN ADD/REMOVE VENUEVIDEOS MODAL--> 
    <div id="modal_model_venue_videos" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" style="width:500px !important;">
            <div class="modal-content portlet">
                <div class="modal-header alert-block bg-grey-salsa">
                    <h4 class="modal-title bold uppercase" style="color:white;"><center>Video</center></h4>
                </div>
                <div class="modal-body">
                    <!-- BEGIN FORM-->
                    <form method="post" id="form_model_venue_videos">
                        <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                        <input type="hidden" name="id" value="" />
                        <input type="hidden" name="show_id" value="" />
                        <input type="hidden" name="action" value="" />
                        <div class="form-body">
                            <div class="row">
                                <div class="form-group">
                                    <label class="control-label col-md-3">Type
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                        <select class="form-control" name="video_type">
                                            @foreach($video_types as $index=>$vt)
                                                <option value="{{$index}}">{{$vt}}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-3 control-label">Embed
                                        <span class="required"> * </span>
                                    </label>
                                    <div class="col-md-9 show-error">
                                        <textarea name="embed_code" class="form-control" rows="4"></textarea>
                                    </div> 
                                </div>
                                <div class="form-group">
                                    <label class="col-md-3 control-label">Description</label>
                                    <div class="col-md-9 show-error">
                                        <textarea name="description" class="form-control" rows="5"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <div class="row">
                                <div class="modal-footer">
                                    <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline">Cancel</button>
                                    <button type="button" id="submit_model_venue_videos" class="btn sbold grey-salsa">Save</button>
                                </div>
                            </div>
                        </div>
                    </form> 
                    <!-- END FORM-->
                </div>
            </div>
        </div>
    </div>
    <!-- END ADD/REMOVE VENUEBANNERS MODAL--> 
@endsection

@section('scripts') 
<script src="/themes/admin/assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js" type="text/javascript"></script>
<script src="/themes/admin/assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js" type="text/javascript"></script>
<script src="/themes/admin/assets/global/plugins/fullcalendar/fullcalendar.min.js" type="text/javascript"></script>
<script src="/themes/admin/assets/global/plugins/clockface/js/clockface.js" type="text/javascript"></script>
<script src="/themes/admin/assets/global/plugins/cubeportfolio/js/jquery.cubeportfolio.min.js" type="text/javascript"></script>
<script src="/js/admin/venues/index.js" type="text/javascript"></script>
@endsection