var TableDatatablesManaged = function () {

    var initTable = function () {
        
        var table = MainDataTableCreator.init('tb_model',[ [1, "asc"] ],5,true);

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

        table.on('click', 'tbody tr td:not(:first-child)', function () {
            var action = $(this).parent().find('.checkboxes').is(':checked');
            if(!action)
                table.find('.checkboxes').prop('checked',false);
            $(this).parent().find('.checkboxes').prop('checked',!action);
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
            $('#form_model_update [name="image_url"]').attr('src','');
            $("#form_model_update input[name='id']:hidden").val('').trigger('change');
            $("#form_model_update input[name='image_url']:hidden").val('').trigger('change');
            $("#form_model_update").trigger('reset');
        };
        //function add
        $('#btn_model_add').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-yellow'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-yellow').addClass('bg-green');
            else $('#modal_model_update_header,#btn_model_save').addClass('bg-green');
            $('#modal_model_update_title').html('Add Band');
            $('#modal_model_update').modal('show');
        });
        //function edit
        $('#btn_model_edit').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-green'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-green').addClass('bg-yellow');
            else $('#modal_model_update_header,#btn_model_save').addClass('bg-yellow');
            var set = $('.group-checkable').attr("data-set");
            var id = $(set+"[type=checkbox]:checked")[0].id;
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/bands',
                data: {id:id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#modal_model_update_title').html(data.band.name);
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
            if($('#form_model_update').valid())
            {
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
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "The form is not valid!<br>Please check the information again.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
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
                            if(data[key] !== '')
                                $('#form_model_update [name="'+key+'"]').val(data[key]);
                }
            });
        });
        //function load form to upload image
        $('#btn_bands_upload_image_url').on('click', function(ev) {
            FormImageUpload('bands.image_url','#modal_model_update','#form_model_update [name="image_url"]');
        });
        //init functions
        check_models();
        if($('#autopen').val() && $('#autopen').val() == 0)
            $('#btn_model_add').click();
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
    return {
        //main function to initiate the module
        init: function () {
            // advance validation
            var rules = {
                name: {
                    minlength: 3,
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
            };
            MainFormValidation.init('form_model_update',rules,{});
        }
    };
}();
//*****************************************************************************************
jQuery(document).ready(function() {
    TableDatatablesManaged.init();
    FormValidation.init();
});
