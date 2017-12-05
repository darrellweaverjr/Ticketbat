<!-- BEGIN ADD/EDIT AWARDS MODAL-->
<div id="modal_model_restaurant_awards" class="modal fade" tabindex="1" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog" style="width:500px !important;">
        <div class="modal-content portlet">
            <div class="modal-header alert-block bg-grey-salsa">
                <h4 class="modal-title bold uppercase" style="color:white;"><center>Add/Edit Award</center></h4>
            </div>
            <div class="modal-body">
                <!-- BEGIN FORM-->
                <form method="post" id="form_model_restaurant_awards" class="form-horizontal">
                    <input type="hidden" name="_token" id="csrf-token" value="{{ Session::token() }}" />
                    <input type="hidden" name="restaurants_id" value="" />
                    <input type="hidden" name="id" value="" />
                    <input type="hidden" name="action" value="1" />
                    <div class="form-body">
                        <div class="alert alert-danger display-hide">
                            <button class="close" data-close="alert"></button> You have some form errors. Please check below. </div>
                        <div class="alert alert-success display-hide">
                            <button class="close" data-close="alert"></button> Your form validation is successful! </div>
                        <div class="row">
                            <div class="form-group">
                                <label class="control-label col-md-3">Awarder
                                    <span class="required"> * </span>
                                </label>
                                <div class="col-md-8 show-error">
                                    <select class="form-control" name="restaurant_media_id">
                                        @foreach($media as $index=>$m)
                                            <option value="{{$m->id}}">{{$m->name}}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <label class="control-label col-md-3">Posted
                                    <span class="required"> * </span>
                                </label>
                                <div class="col-md-8 show-error">
                                    <div id="posted_awards" class="input-group date form_datetime dtpicker">
                                        <input size="16" readonly="" class="form-control" type="text" name="posted" value="{{date('Y-m-d H:i'),strtotime('now')}}">
                                        <span class="input-group-btn">
                                            <button class="btn default date-set" type="button">
                                                <i class="fa fa-calendar"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                                <label class="col-md-3 control-label">Description
                                    <span class="required"> * </span>
                                </label>
                                <div class="col-md-8 show-error">
                                    <textarea name="description" class="form-control" rows="3"></textarea>
                                </div>
                                <label class="control-label col-md-3">Image
                                    <span class="required"> * </span>
                                </label>
                                <div class="col-md-8 show-error" >
                                    <center>
                                        <input type="hidden" name="image_id"/>
                                        <button type="button" id="btn_restaurant_award_upload_image" class="btn btn-block sbold dark btn-outline" >Upload New Image</button>
                                        <img name="image_id" alt="- No image -" src="" width="200px" height="200px" />
                                    </center>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <div class="row">
                            <div class="modal-footer">
                                <button type="button" data-dismiss="modal" class="btn sbold dark btn-outline" onclick="$('#form_model_restaurant_awards').trigger('reset')">Cancel</button>
                                <button type="button" id="submit_model_restaurant_awards" class="btn sbold grey-salsa">Save</button>
                            </div>
                        </div>
                    </div>
                </form>
                <!-- END FORM-->
            </div>
        </div>
    </div>
</div>
<!-- END ADD/EDIT AWARDS MODAL-->