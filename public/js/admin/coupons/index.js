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
                [10, 15, 20, -1],
                [10, 15, 20, "All"] // change per page values here
            ],
            // set the initial value
            "pageLength": 15,            
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
        //table tickets
        $('#tb_ticket').on('click', 'tbody tr td:not(:first-child):not(:last-child)', function () {
            var action = $(this).parent().find('.tcheckboxes').is(':checked');
            $(this).parent().find('.tcheckboxes').prop('checked',!action).trigger('change');
        });
        $('#tb_ticket .tcheckboxes').on('change', function () {
            var active = $(this).is(':checked');
            var value = $(this).val();
            $('#tb_ticket input[name="tickets['+value+']"]').val('');
            $('#tb_ticket input[name="tickets['+value+']"]').prop('disabled',!active);
            if(active) $(this).closest('tr').addClass('warning');
            else $(this).closest('tr').removeClass();
        });
        //start_end_date
        $('#action_dates').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'YYYY-MM-DD',
                separator: ' to ',
                startDate: moment(),
                endDate: moment().add('days', 29),
                minDate: moment()
            },
            function (start, end) {
                $('#form_model_update input[name="start_date"]').val(start.format('YYYY-MM-DD'));
                $('#form_model_update input[name="end_date"]').val(end.format('YYYY-MM-DD'));
            }
        );  
        //effective_start_end_date
        $('#effective_dates').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'YYYY-MM-DD',
                separator: ' to ',
                startDate: moment(),
                endDate: moment().add('days', 29),
                minDate: moment()
            },
            function (start, end) {
                $('#form_model_update input[name="effective_start_date"]').val(start.format('YYYY-MM-DD'));
                $('#form_model_update input[name="effective_end_date"]').val(end.format('YYYY-MM-DD'));
            }
        ); 
        $('#clear_effective_dates').on('click', function(ev) {
            $('#form_model_update [name="effective_start_date"]').val('');
            $('#form_model_update [name="effective_end_date"]').val('');
            $('#effective_dates').datetimepicker('update');
        }); 
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
            $('#form_model_update select[name="discount_type"]').val($('#form_model_update select[name="discount_type"] option:first').val()).trigger('change');
            $('#tb_ticket .tcheckboxes').prop('checked',false).trigger('change');
            $("#form_model_update").trigger('reset');
        };
        //on discount type change
        $('#form_model_update select[name="discount_type"]').on('change', function(ev) {
            var v = $(this).val();
            if(v=='Percent')
            {
                $('#label_num').html('Percent Off');
                $('input[name="start_num"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:100.00,postfix:'%'});
                $('#end_num').css('display','none');
            }
            else if(v=='Dollar')
            {
                $('#label_num').html('Dollars Off');
                $('input[name="start_num"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:1000000,prefix:'$'});
                $('#end_num').css('display','none');
            }
            else
            {
                $('#label_num').html('Buy');
                $('input[name="start_num"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:1000000});
                $('#end_num').css('display','block');
            }
        });
        //function add
        $('#btn_model_add').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-yellow'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-yellow').addClass('bg-green');
            else $('#modal_model_update_header,#btn_model_save').addClass('bg-green');
            $('#modal_model_update_title').html('Add Coupon');
            //change default dates
            var start = moment();
            var end = moment().add(29,'days');
            var start_html = start.format('MMMM D, YYYY');
            var end_html = end.format('MMMM D, YYYY');
            $('#form_model_update [name="start_date"]').val(start.format('YYYY-MM-DD'));
            $('#form_model_update [name="end_date"]').val(end.format('YYYY-MM-DD'));
            $('#form_model_update [name="effective_start_date"]').val(start.format('YYYY-MM-DD'));
            $('#form_model_update [name="effective_end_date"]').val(end.format('YYYY-MM-DD'));
            $('#start_end_date span').html(start_html + ' - ' + end_html);
            $('#effective_start_end_date span').html(start_html + ' - ' + end_html); 
            //show modal
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
            $('#modal_model_update_title').html('Edit Coupon');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/coupons', 
                data: {id:id}, 
                success: function(data) {
                    if(data.success) 
                    {
                        //fill out discount attrb
                        for(var key in data.discount)
                            $('#form_model_update [name="'+key+'"]').val(data.discount[key]);
                        //fill out tickets
                        $.each(data.tickets,function(k, v) {
                            $('#tb_ticket').find('input:checkbox[value="'+v.id+'"]').prop('checked',true).trigger('change');
                            $('#tb_ticket input[name="tickets['+v.id+']"]').val(v.fc);
                        });
                        $('#form_model_update select[name="discount_type"]').trigger('change');
                        //change default dates
                        var start = moment($('#form_model_update [name="start_date"]').val());
                        var end = moment($('#form_model_update [name="end_date"]').val());
                        if(start.isValid()) var start_html = start.format('MMMM D, YYYY');
                        else {
                            var start_html = 'NO START DATE';
                            $('#form_model_update [name="start_date"]').val('');
                        }
                        if(end.isValid()) var end_html = end.format('MMMM D, YYYY');
                        else {
                            var end_html = 'NO END DATE';
                            $('#form_model_update [name="end_date"]').val('');
                        }
                        $('#start_end_date span').html(start_html + ' - ' + end_html);
                        var start = moment($('#form_model_update [name="effective_start_date"]').val());
                        var end = moment($('#form_model_update [name="effective_end_date"]').val());
                        if(start.isValid()) var start_html = start.format('MMMM D, YYYY');
                        else {
                            var start_html = 'NO START DATE';
                            $('#form_model_update [name="effective_start_date"]').val('');
                        }
                        if(end.isValid()) var end_html = end.format('MMMM D, YYYY');
                        else {
                            var end_html = 'NO END DATE';
                            $('#form_model_update [name="effective_end_date"]').val('');
                        }
                        $('#effective_start_end_date span').html(start_html + ' - ' + end_html); 
                        //show modal
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
                        text: "There was an error trying to get the coupon's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    });
                }
            });
        });
        //function save
        $('#btn_model_save').on('click', function(ev) {
            $('#modal_model_update').modal('hide');
            var valid_effective_dates = true;
            if($('#form_model_update [name="effective_dates"]:checkbox').is(':checked')) 
                if($('#form_model_update [name="effective_start_date"]').val()==='' || $('#form_model_update [name="effective_end_date"]').val()==='')
                    valid_effective_dates = false;
            if($('#form_model_update').valid() && valid_effective_dates)
            {
                swal({
                    title: "Saving coupon's information",
                    text: "Please, wait.",
                    type: "info",
                    showConfirmButton: false
                });
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/coupons/save', 
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
                            text: "The form is not valid!<br>Please check the information again.",
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
                title: "The following coupon(s) will be removed, please confirm action: ",
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
                        url: '/admin/coupons/remove', 
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
                                text: "There was an error deleting the coupon(s)!<br>They might have some dependences<br>or<br>the request could not be sent to the server.",
                                html: true,
                                type: "error"
                            });
                        }
                    });
                } 
            });            
        });       
        //init functions
        check_models();        
        $('input[name="start_num"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:1000000});
        $('input[name="end_num"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:1000000});
        $('input[name="quantity"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:1000000});
        $('input.fix_commission').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:999.99,prefix:'$' });
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
                    code: {
                        minlength: 4,
                        maxlength: 20,
                        required: true
                    },
                    description: {
                        minlength: 5,
                        maxlength: 1000,
                        required: true
                    },
                    discount_type: {
                        required: true
                    },  
                    discount_scope: {
                        required: true
                    },
                    coupon_type: {
                        required: true
                    },
                    start_num: {
                        number: true,
                        required: true
                    },
                    end_num: {
                        number: true,
                        required: false
                    },
                    quantity: {
                        digits: true,
                        required: true
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
jQuery(document).ready(function() {
    TableDatatablesManaged.init();
    FormValidation.init();
});