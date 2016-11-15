var TableDatatablesManaged = function () {
    
    var initTable = function () {
        var table = $('#tb_model');
        // begin first table
        table.dataTable({
            // Internationalisation. For more info refer to http://datatables.net/manual/i18n
            "language": {
                "aria": {
                    "sortAscending": ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                },
                "emptyTable": "No data available in table",
                "info": "Showing _START_ to _END_ of _TOTAL_ records",
                "infoEmpty": "No records found",
                "infoFiltered": "(filtered1 from _MAX_ total records)",
                "lengthMenu": "Show _MENU_",
                "search": "Search:",
                "zeroRecords": "No matching records found",
                "paginate": {
                    "previous":"Prev",
                    "next": "Next",
                    "last": "Last",
                    "first": "First"
                }
            },
            //"ajax": '/admin/users/ajax',
            "bStateSave": true, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": [
                [5, 10, 15, 20, -1],
                [5, 10, 15, 20, "All"] // change per page values here
            ],
            // set the initial value
            "pageLength": 10,            
            "pagingType": "bootstrap_full_number",
            "columnDefs": [
                {  // set default column settings
                    'orderable': false,
                    'targets': [0]
                }, 
                {
                    "searchable": false,
                    "targets": [0]
                },
                {
                    "className": "dt-right"
                }
            ],
            "order": [
                [0, "asc"]
            ] // set first column as a default sort by asc
        });
        
        table.find('.group-checkable').change(function () {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            jQuery(set).each(function () {
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
            check_models(); 
        });        
        
        table.on('change', 'tbody tr .checkboxes', function () {
            check_models();             
            $(this).parents('tr').toggleClass("active");
        });
        
        //PERSONALIZED FUNCTIONS
                
        //check/uncheck all
        var check_models = function(){
            var set = $('.group-checkable').attr("data-set");
            var checked = $(set+"[type=checkbox]:checked").length;
            if(checked == 1)
            {
                $('#btn_model_edit').prop("disabled",false);
                $('#btn_model_remove').prop("disabled",false);
            }
            else if(checked > 1)
            {
                $('#btn_model_edit').prop("disabled",true);
                $('#btn_model_remove').prop("disabled",false);
            }
            else
            {
                $('#btn_model_edit').prop("disabled",true);
                $('#btn_model_remove').prop("disabled",true);
            }
            $('#btn_model_add').prop("disabled",false);
        } 
        //function full reset form
        var fullReset = function(){
            $("#form_model_update input[name='id']:hidden").val('').trigger('change');
            $("#form_model_update").trigger('reset');
        };
        //function add
        $('#btn_model_add').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-yellow'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-yellow').addClass('bg-green');
            $('#modal_model_update_title').html('Add Band');
            $('#modal_model_update').modal('show');
        });
        //function edit
        $('#btn_model_edit').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-green'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-green').addClass('bg-yellow');
            var set = $('.group-checkable').attr("data-set");
            var id = $(set+"[type=checkbox]:checked")[0].id;
            $('#modal_model_update_title').html('Edit Band');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/bands', 
                data: {id:id}, 
                success: function(data) {
                    if(data.success) 
                    {
                        for(var key in data.band)
                        {
                            var e = $('#form_model_update [name="'+key+'"]');
                            if(e.is('img'))
                                e.attr('src',data.band[key]);
                            else if(e.is('input:checkbox'))
                                e.prop('checked',data.band[key]);
                            else
                                e.val(data.band[key]);
                        }
                        $('#modal_model_update').modal('show');
                    }
                    else swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        });
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the band's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    });
                }
            });
        });
        //function save
        $('#btn_model_save').on('click', function(ev) {
            $('#modal_model_update').modal('hide');
            swal({
                title: "Saving band's information",
                text: "Please, wait.",
                type: "info",
                showConfirmButton: false
            });
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/bands/save', 
                data: $('#form_model_update').serializeArray(), 
                success: function(data) {
                    if(data.success) 
                    {
                        swal({
                            title: "<span style='color:green;'>Saved!</span>",
                            text: data.msg,
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        });
                        location.reload(); 
                    }
                    else{
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                        });
                    }
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to save the band's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });            
        });
        //function remove
        $('#btn_model_remove').on('click', function(ev) {
            var html = '<ol>';
            var ids = [];
            var set = $('.group-checkable').attr("data-set");
            var checked = $(set+"[type=checkbox]:checked");
            jQuery(checked).each(function (key, item) {
                html += '<li>'+item.value+'</li>';
                ids.push(item.id);
            });             
            swal({
                title: "The following band(s) will be removed, please confirm action: ",
                text: "<span style='text-align:left;color:red;'>"+html+"</span>",
                html: true,
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Confirm",
                cancelButtonText: "Cancel",
                closeOnConfirm: false,
                closeOnCancel: true
              },
              function(isConfirm) {
                if (isConfirm) {
                    var form_delete = $('#form_model_delete');
                    jQuery.ajax({
                        headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                        type: 'POST',
                        url: '/admin/bands/remove', 
                        data: {id:ids}, 
                        success: function(data) {
                            if(data.success)
                            {
                                swal({
                                    title: "<span style='color:green;'>Deleted!</span>",
                                    text: data.msg,
                                    html: true,
                                    timer: 1500,
                                    type: "success",
                                    showConfirmButton: false
                                });
                                location.reload(); 
                            }
                            else swal({
                                    title: "<span style='color:red;'>Error!</span>",
                                    text: data.msg,
                                    html: true,
                                    type: "error"
                                });
                        },
                        error: function(){
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: "There was an error deleting the band(s)!<br>They might have some dependences<br>or<br>the request could not be sent to the server.",
                                html: true,
                                type: "error"
                            });
                        }
                    });
                } 
            });            
        });     
        //function load social media
        $('#btn_load_social_media').on('click', function(ev) {
            var website = $('#form_model_update [name="website"]').val();
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/media/load', 
                data: {url:website}, 
                success: function(data) {
                    if(data) 
                        for(var key in data)
                           $('#form_model_update [name="'+key+'"]').val(data[key]);
                }
            });            
        });
        //function load picture media
        $('#btn_load_picture_media').on('click', function(ev) {
            var website = $('#form_model_update [name="website"]').val();
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/media/load', 
                data: {url:website}, 
                success: function(data) {
                    if(data) 
                        for(var key in data)
                           $('#form_model_update [name="'+key+'"]').val(data[key]);
                }
            });            
        });
        //init functions
        check_models();        
    }
    return {
        //main function to initiate the module
        init: function () {
            if (!jQuery().dataTable) {
                return;
            }
            initTable();        
        }
    };
}();
//*****************************************************************************************
var FormValidation = function () {
    // advance validation
    var handleValidation = function() {
        // for more info visit the official plugin documentation: 
        // http://docs.jquery.com/Plugins/Validation

            var form = $('#form_model_update');
            var error = $('.alert-danger', form);
            var success = $('.alert-success', form);

            //IMPORTANT: update CKEDITOR textarea with actual content before submit
            form.on('submit', function() {
                for(var instanceName in CKEDITOR.instances) {
                    CKEDITOR.instances[instanceName].updateElement();
                }
            })

            form.validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block help-block-error', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: "", // validate all fields including form hidden input
                rules: {
                    name: {
                        minlength: 5,
                        maxlength: 50,
                        required: true
                    },
                    short_description: {
                        minlength: 5,
                        maxlength: 500,
                        required: true
                    },
                    description: {
                        minlength: 5,
                        maxlength: 2000,
                        required: false
                    },  
                    youtube: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    facebook: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    twitter: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    my_space: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    instagram: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    soundcloud: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    },
                    website: {
                        minlength: 5,
                        maxlength: 100,
                        required: false
                    }
                },
                invalidHandler: function (event, validator) { //display error alert on form submit   
                    success.hide();
                    error.show();
                    App.scrollTo(error, -200);
                },

                highlight: function (element) { // hightlight error inputs
                   $(element)
                        .closest('.show-error').addClass('has-error'); // set error class to the control group
                },

                unhighlight: function (element) { // revert the change done by hightlight
                    $(element)
                        .closest('.show-error').removeClass('has-error'); // set error class to the control group
                },

                success: function (label) {
                    label
                        .closest('.show-error').removeClass('has-error'); // set success class to the control group
                },

                submitHandler: function (form) {
                    success.show();
                    error.hide();
                    form[0].submit(); // submit the form
                }

            });
    }
    return {
        //main function to initiate the module
        init: function () {
            handleValidation();
        }
    };
}();
//*****************************************************************************************
var FormFileUpload = function () {    
    return {
        //main function to initiate the module
        init: function () {
            //function when select picture
            $('#myfile').on('change', function(ev) {        
                $('#image_preview').empty();
                var reader = new FileReader();

                reader.onload = function (e) {
                   var img = $('<img id="demo">');
                   img.attr('width', 300);
                   img.attr('weight', 200);
                   img.attr('src', e.target.result);
                   img.appendTo('#image_preview'); 

                   $('#demo').Jcrop({
                        onSelect:    updateCoords,
                        onChange:    updateCoords,
                        bgColor:     'black',
                        bgOpacity:   .4,
                        setSelect:   [ 100, 100, 50, 50 ],
                        //aspectRatio: 16 / 9
                        minSize : [300,200],
                        maxSize : [300,200]
                    });
                    function updateCoords(c)
                    {
                        $('#crop_x').val(c.x);
                        $('#crop_y').val(c.y);
                        $('#crop_w').val(c.w);
                        $('#crop_h').val(c.h);
                    };
                }
            }); 
            //function on submit media
            $('#btn_upload_image').on('click', function(ev) {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/media/upload_image', 
                    data: new FormData(this), 
                    cache: false, 
                    processData:false, 
                    success: function(data) {
                        alert('llego');
                    }
                });            
            });
        }
    };
}();
//*****************************************************************************************
//*****************************************************************************************
//*****************************************************************************************
//*****************************************************************************************

jQuery(document).ready(function() {
    TableDatatablesManaged.init();
    FormValidation.init();
    FormFileUpload.init();
});