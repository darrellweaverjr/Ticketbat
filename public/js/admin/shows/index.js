/* global venue_id */

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
        //on_sale_date
        $('#on_sale_date').datetimepicker({
            autoclose: true,
            isRTL: App.isRTL(),
            format: "yyyy-mm-dd hh:ii",
            pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
            minuteStep: 15,
            startDate: new Date()
        });
        //on_featured_date
        $('#on_featured_date').datetimepicker({
            autoclose: true,
            isRTL: App.isRTL(),
            format: "yyyy-mm-dd hh:ii",
            pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
            minuteStep: 15,
            startDate: new Date()
        });
        $('#amex_only_date').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'YYYY-MM-DD HH:mm',
                separator: ' to ',
                startDate: moment(),
                endDate: moment().add('days', 29),
                minDate: moment()
            },
            function (start, end) {
                $('#amex_only_date input[name="amex_only_start_date"]').val(start.format('YYYY-MM-DD HH:mm'));
                $('#amex_only_date input[name="amex_only_end_date"]').val(end.format('YYYY-MM-DD HH:mm'));
            }
        );
        $('#show_times_date').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'YYYY-MM-DD',
                separator: ' to ',
                startDate: moment(),
                endDate: moment().add('days', 29),
                minDate: moment()
            },
            function (start, end) {
                $('#form_model_show_times input[name="start_date"]').val(start.format('YYYY-MM-DD'));
                $('#form_model_show_times input[name="end_date"]').val(end.format('YYYY-MM-DD'));
            }
        );
        $('#show_passwords_date').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'YYYY-MM-DD',
                separator: ' to ',
                startDate: moment(),
                endDate: moment().add('days', 29),
                minDate: moment()
            },
            function (start, end) {
                $('#form_model_show_passwords input[name="start_date"]').val(start.format('YYYY-MM-DD'));
                $('#form_model_show_passwords input[name="end_date"]').val(end.format('YYYY-MM-DD'));
            }
        );
        //due_date
        $('#show_contracts_effective_date').datepicker({
            autoclose: true,
            isRTL: App.isRTL(),
            format: "yyyy-mm-dd",
            minDate: moment()
        });
        //clear onsale_date
        $('#clear_onsale_date').on('click', function(ev) {
            $('#form_model_update [name="on_sale"]').val('');
            $('#on_sale_date').datetimepicker('update');
        });
        //clear onfeatured_date
        $('#clear_onfeatured_date').on('click', function(ev) {
            $('#form_model_update [name="on_featured"]').val('');
            $('#on_featured_date').datetimepicker('update');
        });
        //clear amex_only_date
        $('#clear_amex_only_date').on('click', function(ev) {
            $('#form_model_update [name="amex_only_start_date"]').val('');
            $('#form_model_update [name="amex_only_end_date"]').val('');
            $('#on_sale_date').datetimepicker('update');
        });
        //clear show_times_date
        $('#clear_show_times_date').on('click', function(ev) {
            $('#form_model_show_times [name="start_date"]').val('');
            $('#form_model_show_times [name="end_date"]').val('');
            $('#show_times_date').datetimepicker('update');
        });
        //show_times_time
        $('.timepicker-no-seconds').timepicker({
                autoclose: true,
                minuteStep: 1
        });
        // handle input group button click
        $('.timepicker').parent('.input-group').on('click', '.input-group-btn', function(e){
            e.preventDefault();
            $(this).parent('.input-group').find('.timepicker').timepicker('showWidget');
        });
        //render calendar when showtimes tab is clicked
        $('a[href="#tab_model_update_showtimes"]').on('click', function(ev) {
            window.setTimeout(function(){
                 calendarShowTimes.fullCalendar('render');
             },300);
        });
        //render calendar when showtimes tab is clicked
        $('#go_to_slug').on('click', function(ev) {
            var id = $('#form_model_update [name="id"]').val();
            var slug = $('#form_model_update [name="slug"]').val();
            if(id && slug)
                window.open('http://www.ticketbat.com/event/'+slug);
        });
        //get slug on name change
        $('#form_model_update [name="name"]').bind('change',function() {
            var id = $('#form_model_update [name="id"]').val();
            if(!id || id=='')
            {
                if($('#form_model_update [name="name"]').val().length >= 5)
                {
                    jQuery.ajax({
                        headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                        type: 'POST',
                        url: '/admin/shows/slug',
                        data: {
                            name:$('#form_model_update [name="name"]').val(),
                            venue_id:$('#form_model_update [name="venue_id"]').val(),
                            show_id:$('#form_model_update [name="id"]').val()
                        },
                        success: function(data) {
                            if(data) $('#form_model_update [name="slug"]').val(data);
                            else $('#form_model_update [name="slug"]').val('');
                        },
                        error: function(){
                            $('#form_model_update [name="slug"]').val('');
                        }
                    });
                }
                else $('#form_model_update [name="slug"]').val('');
            }
        });
        //check/uncheck all
        var check_models = function(){
            var set = $('.group-checkable').attr("data-set");
            var checked = $(set+"[type=checkbox]:checked").length;
            if(checked == 1)
            {
                $('#btn_model_edit').prop("disabled",false);
                $('#btn_model_preview').prop("disabled",false);
                $('#btn_model_remove').prop("disabled",false);
            }
            else if(checked > 1)
            {
                $('#btn_model_edit').prop("disabled",true);
                $('#btn_model_preview').prop("disabled",true);
                $('#btn_model_remove').prop("disabled",false);
            }
            else
            {
                $('#btn_model_edit').prop("disabled",true);
                $('#btn_model_preview').prop("disabled",true);
                $('#btn_model_remove').prop("disabled",true);
            }
            $('#btn_model_add').prop("disabled",false);
        }
        //function full reset form
        var fullReset = function(){
            $("#form_model_update input[name='id']:hidden").val('').trigger('change');
            $("#form_model_update").trigger('reset');
            $('#form_model_update img[name="logo_url"]').attr('src','');
            $('#form_model_update img[name="header_url"]').attr('src','');
        };
        //function add
        $('#btn_model_add').on('click', function(ev) {
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-yellow'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-yellow').addClass('bg-green');
            else $('#modal_model_update_header,#btn_model_save').addClass('bg-green');
            $('#modal_model_update_title').html('Add Show');
            $('a[href="#tab_model_update_checking"]').parent().css('display','none');
            $('#form_model_update .ticket_types_lists').empty();
            $('a[href="#tab_model_update_showtimes"]').parent().css('display','none');
            $('a[href="#tab_model_update_tickets"]').parent().css('display','none');
            $('a[href="#tab_model_update_bands"]').parent().css('display','none');
            $('a[href="#tab_model_update_sweepstakes"]').parent().css('display','none');
            $('a[href="#tab_model_update_contracts"]').parent().css('display','none');
            $('a[href="#tab_model_update_multimedia"]').parent().css('display','none');
            $("#form_model_update").trigger('reset');
            $('#modal_model_update').modal('show');
        });
        //function load form to upload image
        $('#btn_shows_upload_sponsor_logo_id').on('click', function(ev) {
            FormImageUpload('shows.sponsor_logo_id','#modal_model_update','#form_model_update [name="sponsor_logo_id"]');
        });
        function onVenueChange(all){
            //init
            var venue_id = $('#form_model_update [name="venue_id"]').find('option:selected').val();
            var venue_rest = $('#form_model_update [name="venue_id"]').find('option:selected').attr('rel');
            //show stages
            $('#form_model_update select[name="stage_id"]').empty();
            var stages = $('#form_model_update select[name="stage_id"]').data('content');
            if(stages)
            {
                $.each(stages,function(k, v) {
                    if(v.venue_id == venue_id)
                        $('#form_model_update select[name="stage_id"]').append('<option value="'+v.id+'">'+v.name+'</option>');
                });
                $('#form_model_update select[name="stage_id"] option:first').prop('selected',true);
            }
            //show restrictions
            $('#form_model_update [name="restrictions"] option').each(function()
            {
                if($(this).val() == venue_rest)
                {
                    $(this).prop('selected',true);
                    $(this).text($(this).val()+' - Venue default');
                }
                else
                {
                    $(this).prop('selected',false);
                    $(this).text($(this).val()+' - WARNING: Not venue default');
                }
            });
            if(all){
                //select default reports for that venue
                if(venue_id && venue_id != '')
                {
                    jQuery.ajax({
                        headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                        type: 'POST',
                        url: '/admin/shows',
                        data: { venue_id:venue_id },
                        success: function(data) {
                            if(data)
                            {
                                $('#form_model_update input[name="emails"]').val(data.default.weekly_email);
                                $('#form_model_update input[name="accounting_email"]').val(data.default.accounting_email);
                                $('#form_model_update .make-switch:checkbox[name="daily_sales_emails"]').bootstrapSwitch('state',(data.default.daily_sales_emails>0)? true : false);
                            }
                            else
                            {
                                $('#form_model_update input[name*="email"]').val('');
                                $('#form_model_update .make-switch:checkbox[name*="_emails"]').bootstrapSwitch('state',false);
                            }
                        },
                        error: function(){
                            $('#form_model_update input[name*="email"]').val('');
                            $('#form_model_update .make-switch:checkbox[name*="_emails"]').bootstrapSwitch('state',false);
                        }
                    });
                }
                else
                {
                    $('#form_model_update input[name*="email"]').val('');
                    $('#form_model_update .make-switch:checkbox[name*="_emails"]').bootstrapSwitch('state',false);
                }
            }
        }
        //on select venue
        $('#form_model_update [name="venue_id"]').on('change', function(ev) {
            onVenueChange(true);
        });
        //funcion load modal by id
        function loadModal(data) {
            //reset modal
            fullReset();
            if($('#modal_model_update_header').hasClass('bg-green'))
                $('#modal_model_update_header,#btn_model_save').removeClass('bg-green').addClass('bg-yellow');
            else $('#modal_model_update_header,#btn_model_save').addClass('bg-yellow');
            $('a[href="#tab_model_update_checking"]').parent().css('display','block');
            $('#form_model_update .ticket_types_lists').empty();
            $('#form_model_show_passwords .ticket_types_lists').empty();
            $('#tb_show_passwords').empty();
            $('a[href="#tab_model_update_showtimes"]').parent().css('display','block');
            $('#form_model_show_times_toggle .ticket_types_lists').empty();
            $('#form_model_show_times .ticket_types_lists').empty();
            $('a[href="#tab_model_update_tickets"]').parent().css('display','block');
            $('#tb_show_tickets').empty();
            $('a[href="#tab_model_update_bands"]').parent().css('display','block');
            $('a[href="#tab_model_update_contracts"]').parent().css('display','block');
            $('#tb_show_contracts').empty();
            $('a[href="#tab_model_update_sweepstakes"]').parent().css('display','block');
            $('#tb_sub_sweepstakes').empty();
            $('a[href="#tab_model_update_multimedia"]').parent().css('display','block');
            $('#modal_model_update_title').html(data.show.name);
            //fill out defaults
            $('#form_model_update [name="venue_id"]').val(data.show.venue_id);
            onVenueChange(false);
            $('#form_model_show_passwords input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_tickets input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_times input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_images input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_banners input[name="parent_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_videos input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            $('#form_model_show_contracts input[name="show_id"]:hidden').val(data.show.id).trigger('change');
            //fill out shows
            for(var key in data.show)
            {
                //checking
                if(key=='on_sale' || key=='amex_only_start_date' || key=='amex_only_end_date')
                    if(data.show[key]=='0000-00-00 00:00:00')
                        data.show[key] = '';
                else if(key=='stage_id')
                {
                    $('#form_model_update select[name="stage_id"] option').prop('selected',false);
                    $('#form_model_update select[name="stage_id"]').val(data.show.stage_id).trigger('change');
                }
                //fill out
                var e = $('#form_model_update [name="'+key+'"]');
                if(e.is('input:checkbox'))
                    $('#form_model_update .make-switch:checkbox[name="'+key+'"]').bootstrapSwitch('state', (data.show[key]>0)? true : false, true);
                else if(key=='logo_url' || key=='header_url' || key=='sponsor_logo_id')
                {
                    $('#form_model_update img[name="'+key+'"]').attr('src',data.show[key]);
                    $('#form_model_update input[name="'+key+'"]').val(data.show[key]);
                }
                else if(key!='venue_id' && key!='stage_id')
                    e.val(data.show[key]);
            }
            //fill out checking ticket
            if(data.tickets)
            {
                if(data.show.amex_only_ticket_types && data.show.amex_only_ticket_types!='') var amex_tt = data.show.amex_only_ticket_types.split(','); else var amex_tt = [];
                if(data.ticket_types_inactive && data.ticket_types_inactive!='') var tt_inactive = data.ticket_types_inactive.split(','); else var tt_inactive = [];
                $.each(data.tickets,function(k, v) {
                    if(v.is_active == 1 && tt_inactive.indexOf(v.ticket_type)<0)
                    {
                        if(amex_tt.indexOf(v.ticket_type)>=0)
                            var checked = 'checked';
                        else var checked = '';
                        $('#modal_model_update .ticket_types_lists').append('<label class="mt-checkbox"><input type="checkbox" name="ticket_types[]" value="'+v.id+'" '+checked+' />'+v.ticket_type+'<span></span></label><br>');
                        $('#modal_model_show_passwords .ticket_types_lists').append('<br><label class="mt-checkbox"><input type="checkbox" name="ticket_types[]" value="'+v.id+'" />'+v.ticket_type+'<span></span></label>');
                        $('#form_model_show_times_toggle .ticket_types_lists').append('<br><label class="mt-checkbox"><input type="checkbox" name="ticket_types[]" value="'+v.id+'" />'+v.ticket_type+'<span></span></label>');
                        $('#form_model_show_times .ticket_types_lists').append('<br><label class="mt-checkbox"><input type="checkbox" name="ticket_types[]" value="'+v.id+'" />'+v.ticket_type+'<span></span></label>');
                    }
                });
            }
            if(data.tickets_default)
            {
                $.each(data.tickets_default,function(k, v) {
                    $('#form_model_show_tickets_default input:hidden[name="'+k+'"]').val(v);
                });
            }
            else
                $('#form_model_show_tickets_default').trigger('reset');
            //fill out passwords
            if(data.passwords && data.passwords.length)
            {
                var row_edit = '<td><button type="button" class="btn sbold bg-yellow edit"><i class="fa fa-edit"></i></button></td><td><button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button></td>';
                $.each(data.passwords,function(k, v) {
                    $('#tb_show_passwords').append('<tr class="'+v.id+'"><td>'+v.password+'</td><td>'+v.start_date+'</td><td>'+v.end_date+'</td><td>'+v.ticket_types+'</td>'+row_edit+'</tr>');
                });
            }
            //fill out tickets
            $('#form_model_show_contracts select[name="ticket_id"]').append('<option disabled selected value=""></option>');
            if(data.tickets && data.tickets.length)
            {
                update_tickets(data.tickets,1);
            }
            //fill out bands
            tableBands.clear().draw();
            if(data.bands && data.bands.length)
            {
                var row_edit = '<button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button>';
                $.each(data.bands,function(k, v) {
                    tableBands.row.add( [ v.n_order,v.name,row_edit ] ).draw();
                });
            }
            //fill out sweepstakes
            if(data.sweepstakes && data.sweepstakes.length)
            {
                $.each(data.sweepstakes,function(k, v) {
                    var selected = ''; if(v.selected==1) selected = 'checked';
                    var checkbox = '<label class="mt-checkbox mt-checkbox-single mt-checkbox-outline"><input type="checkbox" name="user_id[]" value="'+v.user_id+'" '+selected+'><span></span></label>';
                    $('#tb_sub_sweepstakes').append('<tr><td>'+checkbox+'</td><td>'+v.name+'</td><td>'+v.email+'</td><td>'+v.address+'</td><td>'+v.created+'</td></tr>');
                });
            }
            //fill out showtimes
            calendarShowTimes.fullCalendar('removeEvents');
            calendarShowTimes.fullCalendar('removeEventSources');
            if(data.show_times && data.show_times.length)
            {
                $.each(data.show_times,function(k, v) {
                    fn_show_times(v) ;
                });
            }
            //fill out contracts
            if(data.contracts && data.contracts.length)
            {
                var row_edit = '<td><button type="button" class="btn sbold bg-blue view"><i class="fa fa-file-pdf-o"></i></button></td><td><button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button></td>';
                $.each(data.contracts,function(k, v) {
                    //status for cron job
                    if(!v.data)
                        v.data = '<span class="label label-sm sbold label-warning">Nothing to run</span>';
                    else
                        v.data = '<span class="label label-sm sbold label-danger">Pending</span>';
                    var updated = moment(v.updated);
                    var effective_date = moment(v.effective_date);
                    $('#tb_show_contracts').append('<tr data-id="'+v.id+'" ><td>'+updated.format('MM/DD/YYYY h:mma')+'</td><td>'+effective_date.format('MM/DD/YYYY')+'</td><td>'+v.data+'</td>'+row_edit+'</tr>');
                });
            }
            //fill out images
            $('#grid_show_images .cbp-item').remove();
            $('#grid_show_images').trigger('resize.cbp');
            if(data.images && data.images.length)
            {
                var html = '';
                $.each(data.images,function(k, v) {
                    html = html + fn_show_images(v);
                });
                $('#grid_show_images').cubeportfolio('appendItems', html);
                $('#grid_show_images').trigger('resize.cbp');
            }
            //fill out banners
            $('#grid_show_banners .cbp-item').remove();
            $('#grid_show_banners').trigger('resize.cbp');
            if(data.banners && data.banners.length)
            {
                var html = '';
                $.each(data.banners,function(k, v) {
                    html = html + fn_show_banners(v);
                });
                $('#grid_show_banners').cubeportfolio('appendItems', html);
                $('#grid_show_banners').trigger('resize.cbp');
            }
            //fill out videos
            $('#grid_show_videos .cbp-item').remove();
            $('#grid_show_videos').trigger('resize.cbp');
            if(data.videos && data.videos.length)
            {
                var html = '';
                $.each(data.videos,function(k, v) {
                    html = html + fn_show_videos(v);
                });
                $('#grid_show_videos').cubeportfolio('appendItems', html);
                $('#grid_show_videos').trigger('resize.cbp');
            }
            //show modal
            $('#modal_model_update').modal('show');
        }
        //function preview
        $('#btn_model_preview').on('click', function(ev) {
            var set = $('.group-checkable').attr("data-set");
            var link = $(set+"[type=checkbox]:checked:first").data('preview');
            window.open(link, '_blank');
        });
        //function edit
        $('#btn_model_edit').on('click', function(ev) {
            var set = $('.group-checkable').attr("data-set");
            var id = $(set+"[type=checkbox]:checked")[0].id;
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows',
                data: {id:id},
                success: function(data) {
                    if(data.success)
                    {
                        loadModal(data);
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
                        text: "There was an error trying to get the event's information!<br>The request could not be sent to the server.",
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
                    title: "Saving show's information",
                    text: "Please, wait.",
                    type: "info",
                    showConfirmButton: false
                });
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/save',
                    data: $('#form_model_update').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            if(typeof(data.show) != 'undefined' && data.show !== null)
                                loadModal(data);
                            else
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
                            text: "There was an error trying to save the show's information!<br>The request could not be sent to the server.",
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
                var tabs = $('#form_model_update .has-error').closest('.tab-pane');
                var names = [];
                $.each(tabs,function(k, v) {
                    names.push( $('a[href="#'+v.id+'"]').html() );
                });
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "The form is not valid!<br>Please check the information again in tab(s): "+names.join(', '),
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
                title: "The following show(s) will be removed, please confirm action: ",
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
                        url: '/admin/shows/remove',
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
                                text: "There was an error deleting the show(s)!<br>They might have some dependences<br>or<br>the request could not be sent to the server.",
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
            var website = $('#form_model_update [name="url"]').val();
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
        //function load form to upload logo
        $('#btn_shows_upload_logo_url').on('click', function(ev) {
            FormImageUpload('shows.logo_url','#modal_model_update','#form_model_update [name="logo_url"]');
        });
        //function load form to upload header
        $('#btn_shows_upload_header_url').on('click', function(ev) {
            FormImageUpload('shows.header_url','#modal_model_update','#form_model_update [name="header_url"]');
        });

        //function with show_passwords  *****************************************************************************************************   SHOW PASSWORD BEGIN
        $('#btn_model_password_add').on('click', function(ev) {
            $('#form_model_show_passwords input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_passwords').trigger('reset');
            $('#modal_model_show_passwords').modal('show');
        });
        $('#tb_show_passwords').on('click', 'button', function(e){
            var row = $(this).closest('tr');
            //edit
            if($(this).hasClass('edit'))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/passwords',
                    data: {action:0,id:row.prop('class')},
                    success: function(data) {
                        if(data.success)
                        {
                            $('#form_model_show_passwords').trigger('reset');
                            $('#form_model_show_passwords input[name="id"]:hidden').val(data.password.id).trigger('change');
                            //fill out passwords
                            for(var key in data.password)
                            {
                                //fill out
                                $('#form_model_show_passwords [name="'+key+'"]').val(data.password[key]);
                            }
                            $.each(data.password.ticket_types,function(k, t) {
                                $('#form_model_show_passwords :checkbox[value="'+t+'"]').prop('checked',true);
                            });
                            $('#modal_model_show_passwords').modal('show');
                        }
                        else{
                            $('#modal_model_update').modal('hide');
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
                        $('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to get the password's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                        });
                    }
                });
            }
            //delete
            else if($(this).hasClass('delete'))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/passwords',
                    data: {action:-1,id:row.prop('class')},
                    success: function(data) {
                        if(data.success)
                            row.remove();
                        else{
                            $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to delete the password!<br>The request could not be sent to the server.",
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
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "Invalid Option",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function submit show_passwords
        $('#submit_model_show_passwords').on('click', function(ev) {
            $('#modal_model_show_passwords').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_passwords').valid() && $('#form_model_show_passwords [name="ticket_types[]"]:checked').length)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/passwords',
                    data: $('#form_model_show_passwords').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            var v = data.password;
                            var row_edit = '<td><button type="button" class="btn sbold bg-yellow edit"><i class="fa fa-edit"></i></button></td><td><button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button></td>';
                            //update row
                            if($('#tb_show_passwords').find('tr[class="'+v.id+'"]').length)
                                $('#tb_show_passwords').find('tr[class="'+v.id+'"]').html('<td class="password">'+v.password+'</td><td class="start_date">'+v.start_date+'</td><td class="end_date">'+v.end_date+'</td><td class="ticket_types">'+v.ticket_types+'</td>'+row_edit);
                            //add row
                            else
                                $('#tb_show_passwords').append('<tr class="'+v.id+'"><td class="password">'+v.password+'</td><td class="start_date">'+v.start_date+'</td><td class="end_date">'+v.end_date+'</td><td class="ticket_types">'+v.ticket_types+'</td>'+row_edit+'</tr>');
                            //show modal
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_passwords').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the password's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_passwords').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_passwords').modal('show');
                });
            }
        });
        //function with show_passwords  *****************************************************************************************************   SHOW PASSWORD END
        //function with show_sweepstakes  *****************************************************************************************************   SHOW sweepstakes BEGIN
        //function submit show_sweepstakes
        $('#btn_model_sweepstakes_edit').on('click', function(ev) {
            $('#modal_model_update').modal('hide');
            if($('#tb_sub_sweepstakes [name="user_id[]"]:checked').length)
            {
                var user_id = [];
                $('#tb_sub_sweepstakes [name="user_id[]"]:checked').each(function() {
                    user_id.push($(this).val());
                });
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/sweepstakes',
                    data: {show_id:$('#form_model_update [name="id"]:hidden').val(),user_id:user_id},
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Selected!</span>",
                                text: data.msg,
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            $('#modal_model_update').modal('show');
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
                            text: "There was an error trying to save the sweepstakes' selection!<br>The request could not be sent to the server.",
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
                    text: "You must select at least one valid element!",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function with show_sweepstakes  *****************************************************************************************************   SHOW sweepstakes END
        //function with show_tickets  *******************************************************************************************************   SHOW TICKETS BEGIN

        function update_tickets(items,option=0)
        {
            $('#tb_show_tickets').empty();
            var row_edit = '<td><button type="button" class="btn sbold bg-yellow edit"><i class="fa fa-edit"></i></button></td>';
            $.each(items,function(k, v) {
                //default style
                if(v.is_default==1)
                    v.is_default = '<span class="label label-sm sbold label-success"> Yes </span>';
                else
                    v.is_default = '<span class="label label-sm sbold label-danger"> No </span>';
                //active style
                if(v.is_active==1)
                    v.is_active = '<span class="label label-sm sbold label-success"> Active </span>';
                else
                    v.is_active = '<span class="label label-sm sbold label-danger"> Inactive </span>';
                //unlimited tickets
                if(!(v.max_tickets>0)) v.max_tickets = '&#8734;';
                //inclusive fees or over the price
                if(v.inclusive_fee>0)
                    v.inclusive_fee = '<span class="label label-sm sbold label-success">Incl.</span>';
                else
                    v.inclusive_fee = '<span class="label label-sm sbold label-danger">Over p.</span>';
                //commission$
                if(!v.fixed_commission) v.fixed_commission = '0.00';
                $('#tb_show_tickets').append('<tr class="'+v.id+'"><td>'+v.ticket_type+'</td><td>'+v.title+'</td><td>$'+v.retail_price+'</td><td>$'+v.processing_fee+'</td><td>'+v.percent_pf+'%</td><td>$'+v.fixed_commission+'</td><td>'+v.percent_commission+'%</td><td><center>'+v.is_default+'</center></td><td><center>'+v.max_tickets+'</center></td><td><center>'+v.is_active+'</center></td><td><center>'+v.inclusive_fee+'</center></td>'+row_edit+'</tr>');
                if(option)
                    $('#form_model_show_contracts select[name="ticket_id"]').append('<option value="'+v.id+'">'+v.ticket_type+' ('+v.is_active+') '+v.title+'</option>');
            });
        }
        //on select ticket_type
        $('#form_model_show_tickets [name="ticket_type"]').on('change', function(ev) {
            var classX = $(this).find('option:selected').attr('data-class');
            $('#form_model_show_tickets [name="ticket_type_class"]').val(classX);
        });
        function toggle_default_tickets()
        {
            if( $('#form_model_show_tickets .make-switch:checkbox[name="only_posx"]').is(':checked'))
            {
                $('#form_model_show_tickets [name="processing_fee"]').val($('#form_model_show_tickets_default input[name="default_processing_fee_pos"]').val());
                $('#form_model_show_tickets [name="percent_pf"]').val($('#form_model_show_tickets_default input[name="default_percent_pfee_pos"]').val());
                $('#form_model_show_tickets [name="fixed_commission"]').val($('#form_model_show_tickets_default input[name="default_fixed_commission_pos"]').val());
                $('#form_model_show_tickets [name="percent_commission"]').val($('#form_model_show_tickets_default input[name="default_percent_commission_pos"]').val());
            }
            else
            {
                $('#form_model_show_tickets [name="processing_fee"]').val($('#form_model_show_tickets_default input[name="default_processing_fee"]').val());
                $('#form_model_show_tickets [name="percent_pf"]').val($('#form_model_show_tickets_default input[name="default_percent_pfee"]').val());
                $('#form_model_show_tickets [name="fixed_commission"]').val($('#form_model_show_tickets_default input[name="default_fixed_commission"]').val());
                $('#form_model_show_tickets [name="percent_commission"]').val($('#form_model_show_tickets_default input[name="default_percent_commission"]').val());
            }
        }
        $('#btn_model_ticket_add').on('click', function(ev) {            
            toggle_default_tickets();
            $('#form_model_show_tickets input[name="id"]:hidden').val('').trigger('change');
            $('#modal_model_show_tickets').modal('show');
        });
        $('#form_model_show_tickets .make-switch:checkbox[name="only_posx"]').on('switchChange.bootstrapSwitch', function (event, state) {
            toggle_default_tickets();
        }); 
        $('#tb_show_tickets').on('click', 'button', function(e){
            var row = $(this).closest('tr');
            //edit
            if($(this).hasClass('edit'))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/tickets',
                    data: {action:0,id:row.prop('class')},
                    success: function(data) {
                        if(data.success)
                        {
                            $('#form_model_show_tickets').trigger('reset');
                            $('#form_model_show_tickets input[name="id"]:hidden').val(data.ticket.id).trigger('change');
                            //fill out tickets
                            for(var key in data.ticket)
                            {
                                //fill out
                                if(key!='is_default' && key!='is_active')
                                    $('#form_model_show_tickets [name="'+key+'"]').val(data.ticket[key]);
                            } 
                            $('#form_model_show_tickets .make-switch:checkbox[name="is_default"]').bootstrapSwitch('state', (data.ticket.is_default>0)? true : false, true);
                            $('#form_model_show_tickets .make-switch:checkbox[name="is_active"]').bootstrapSwitch('state', (data.ticket.is_active>0)? true : false, true);
                            $('#form_model_show_tickets .make-switch:checkbox[name="inclusive_feex"]').bootstrapSwitch('state', (data.ticket.inclusive_fee>0)? true : false, true);
                            $('#form_model_show_tickets .make-switch:checkbox[name="only_posx"]').bootstrapSwitch('state', (data.ticket.only_pos>0)? true : false, true);
                            $('#modal_model_show_tickets').modal('show');
                        }
                        else{
			    $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to get the ticket's information!<br>The request could not be sent to the server.",
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
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "Invalid Option",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function submit show_tickets
        $('#submit_model_show_tickets').on('click', function(ev) {
            $('#modal_model_show_tickets').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_tickets').valid())
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/tickets',
                    data: $('#form_model_show_tickets').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            },function(){
                                update_tickets(data.tickets);
                                $('#modal_model_update').modal('show');
                                swal.close();
                            });
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_tickets').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the ticket's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_tickets').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form'",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_tickets').modal('show');
                });
            }
        });
        //function with show_tickets  *******************************************************************************************************   SHOW TICKETS END
        //function with show_bands  *****************************************************************************************************   SHOW BANDS BEGIN
        //init datatables
        var tableBands = $('#tb_sub_bands').DataTable({ rowReorder: true});
        //add
        $('#btn_model_band_add').on('click', function(ev) {
            $('#form_model_show_bands input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_bands').trigger('reset');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/bands',
                data: {action:2},
                success: function(data) {
                    if(data.success)
                    {
                        $('#form_model_show_bands select[name="band_id"]').empty();
                        $.each(data.bands,function(k, b) {
                            $('#form_model_show_bands select[name="band_id"]').append('<option value="'+b.id+'">'+b.name+'</option>');
                        });
                        $('#modal_model_show_bands').modal('show');
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the bands!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //create new
        $('#btn_model_band_create').on('click', function(ev) {
            window.open('/admin/bands/0', '_blank');
        });
        //edit
        tableBands.on( 'row-reordered', function ( e, diff, edit ) {
            var show_id = $('#form_model_update input[name="id"]:hidden').val();
            var order = [];
            for ( var i=0, ien=diff.length ; i<ien ; i++ ) {
                order.push(diff[i].oldData);
            }
            if(order.length > 1)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/bands',
                    data: {action:0,show_id:show_id,order:order},
                    success: function(data) {
                        if(!data.success)
                        {
			    $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to re-order the band from this show!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                        });
                    }
                });
            }
        } );
        //delete
        $('#tb_sub_bands tbody').on('click', 'button', function(e){
            var show_id = $('#form_model_update input[name="id"]:hidden').val();
            var row = $(this).closest('tr');
            var order = tableBands.row(row).data()[0];
            if($(this).hasClass('delete'))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/bands',
                    data: {action:-1,show_id:show_id,order:order},
                    success: function(data) {
                        if(data.success)
                        {
                            tableBands.clear().draw();
                            if(data.bands && data.bands.length)
                            {
                                var row_edit = '<button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button>';
                                $.each(data.bands,function(k, v) {
                                    tableBands.row.add( [ v.n_order,v.name,row_edit ] ).draw();
                                });
                            }
                        }
                        else
                        {
			    $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to delete the band from this show!<br>The request could not be sent to the server.",
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
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "Invalid Option",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function submit show_bands
        $('#submit_model_show_bands').on('click', function(ev) {
            $('#modal_model_show_bands').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_bands').valid())
            {
                var show_id = $('#form_model_update input[name="id"]:hidden').val();
                var band_id = $('#form_model_show_bands select[name="band_id"]').val();
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/bands',
                    data: {action:1,show_id:show_id,band_id:band_id},
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            tableBands.row.add( [ data.band.n_order,data.band.name,'<input type="button" value="Delete" class="btn sbold bg-red delete">' ] ).draw();
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_bands').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the password's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_bands').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_bands').modal('show');
                });
            }
        });
        //function with show_bands  *****************************************************************************************************   SHOW BANDS END
        //function with show_times  *****************************************************************************************************   SHOW TIMES BEGIN
        //init calendar
        var calendarShowTimes = $('#show_show_times').fullCalendar({
            header: { left: 'title', center: '', right: 'prev,next, agendaDay, agendaWeek, month, today' },
            defaultView: 'month', // change default view with available options from http://arshaw.com/fullcalendar/docs/views/Available_Views/
            slotMinutes: 15,
            editable: false,
            droppable: false,
            eventClick:  function(event, jsEvent, view) {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/showtimes',
                    data: {id:event.id},
                    success: function(data) {
                        if(data.success)
                        {
                            $('#form_model_show_times_toggle').trigger('reset');
                            $('#form_model_show_times_toggle input[name="id"]:hidden').val(event.id).trigger('change');
                            $('#form_model_show_times_toggle .make-switch:checkbox[name="is_active"]').bootstrapSwitch('state', (data.showtime.is_active>0)? true : false, true);
                            $.each(data.tickets,function(k, t) {
                                $('#form_model_show_times_toggle :checkbox[value="'+t+'"]').prop('checked',true);
                            });
                            var st = moment(event.showtime);
                            $('#form_model_show_times_toggle input[name="slug"]').val(data.showtime.slug);
                            if(data.showtime.slug)
                                var link = data.showtime.slug;
                            else if($('#form_model_update input[name="ext_slug"]').val())
                                var link = $('#form_model_update input[name="ext_slug"]').val();
                            else
                                var link = 'http://www.ticketbat.com/buy/'+$('#form_model_update input[name="slug"]').val()+'/'+event.id;
                            $('.link_model_show_times_toggle').html(st.format('dddd, MMMM Do, YYYY @ hh:mm A')+'<br><a href="'+link+'" target="_blank">'+link+'</a>');
                            $('#modal_model_show_times_toggle').modal('show');
                        }
                        else{
			    $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to get the showtime's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                        });
                    }
                });
            }
        });
        //fn fill out showtimes
        var fn_show_times = function(event)
        {
            var maintitle = ' ';
            var color = 'gray';
            var y = event.show_time.substr(0,4);
            var m = event.show_time.substr(5,2)-1;
            var d = event.show_time.substr(8,2);
            var h = event.show_time.substr(11,2);
            var i = event.show_time.substr(14,2);
            var date = new Date(y,m,d,h,i);
            var allday = false;
            if(event.is_active == 0)
            {
                var title = maintitle+'(Inactive)';
                color = App.getBrandColor('red');
            }
            else
            {
                var title = maintitle+'(Active)';
                if(date.getHours() >= 6 && date.getHours() < 12)
                    color = App.getBrandColor('green');
                else if(date.getHours() >= 12 && date.getHours() <= 18)
                    color = App.getBrandColor('blue');
                else
                    color = App.getBrandColor('purple');
            }
            if(event.time_alternative)
            {
                title += ': '+event.time_alternative;
                allday =true;
                var color = App.getBrandColor('yellow');
            }
            //fill out the items in calendar
            calendarShowTimes.fullCalendar('renderEvent', {
                id:event.id,
                showtime:event.show_time,
                title: title,
                start: date,
                end: date,
                backgroundColor: color,
                allDay: allday
            }, true);
        };
        //show times remove
        $('#tb_show_times').on('click', 'input[type="button"]', function(e){
            $(this).closest('tr').remove();
        });
        //function submit show_times toggle
        $('#submit_model_show_times_toggle').on('click', function(ev) {
            $('#modal_model_show_times_toggle').modal('hide');
            $('#modal_model_update').modal('hide');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/showtimes',
                data: $('#form_model_show_times_toggle').serializeArray(),
                success: function(data) {
                    if(data.success)
                    {
                        swal({
                            title: "<span style='color:green;'>Saved!</span>",
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        });
                        calendarShowTimes.fullCalendar('removeEvents', data.showtime.id);
                        fn_show_times(data.showtime);
                        //show modal
                        $('#modal_model_update').modal('show');
                    }
                    else
                    {
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_times_toggle').modal('show');
                        });
                    }
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to save the showtime's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                        $('#modal_model_show_times_toggle').modal('show');
                    });
                }
            });
        });
        $('#btn_model_show_time_add').on('click', function(ev) {
            $('#form_model_show_times').trigger('reset');
            $('#tb_show_times').empty();
            $('#form_model_show_times input[name="action"]:hidden').val('1').trigger('change');
            $('#subform_show_times').css('display','none');
            $('#modal_model_show_times').modal('show');
        });
        //open purchases pagen on click when purchase no available
        $(document).on('click', 'a.link-purchases', function(e){
            e.preventDefault();
            window.open('/admin/purchases?show='+$(this).attr('href')+'?showtime_start_date='+$(this).attr('rel')+'?showtime_end_date='+$(this).attr('rel'),'_blank');
        });
        $('#available_show_times').on('click', function(ev) {
            $('#tb_show_times').empty();
            $('#tb_show_times').append('<tr><td colspan="5"><center><h3>Checking. Please Wait...</h3></center></td></tr>');
            var action = $('#form_model_show_times input[name="action"]:hidden').val();
            var show_id = $('#form_model_show_times input[name="show_id"]:hidden').val();
            var start_date = $('#form_model_show_times input[name="start_date"]').val();
            var end_date = $('#form_model_show_times input[name="end_date"]').val();
            var time = $('#form_model_show_times input[name="time"]').val();
            var time_alternative = $('#form_model_show_times input[name="time_alternative"]').val();
            var weekdays = [];
            $('#form_model_show_times input[name="days[]"]:checked').each(function(){
                weekdays.push($(this).val()) ;
             });
            if(weekdays.length)
            {
                if(start_date != '' && end_date != '')
                {
                    if(time != '')
                    {
                        if(action>0) var action = 'add';
                        else if(action==0) var action = 'update';
                        else var action = 'delete';
                        jQuery.ajax({
                            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                            type: 'POST',
                            url: '/admin/shows/showtimes',
                            data: {action:action,show_id:show_id,weekdays:weekdays,start_date:start_date,end_date:end_date,time:time,time_alternative:time_alternative},
                            success: function(data) {
                                if(data.success)
                                {
                                    $('#tb_show_times').empty();
                                    $.each(data.dates,function(k, v) {
                                        var st = moment(v.showtime);
                                        //default style
                                        if(v.available)
                                            var available = '<input type="hidden" name="showtime[]" value="'+v.showtime+'"><span class="label label-sm sbold label-success">Yes</span>';
                                        else
                                            var available = '<a class="link-purchases" href="'+show_id+'" rel="'+st.format('YYYY-MM-DD')+'"><span class="label label-sm sbold label-danger">No</span></a>';
                                        $('#tb_show_times').append('<tr><td>'+st.format('dddd')+'</td><td>'+st.format('MM/DD/YYYY')+'</td><td>'+st.format('h:mma')+'</td><td><center>'+available+'</center></td><td><input type="button" value="X" class="btn sbold bg-red red"></td></tr>');
                                    });
                                }
                                else
                                {
                                    $('#modal_model_show_times').modal('hide');
                                    $('#modal_model_update').modal('hide');
                                    swal({
                                        title: "<span style='color:red;'>Error!</span>",
                                        text: data.msg,
                                        html: true,
                                        type: "error"
                                    },function(){
                                        $('#modal_model_update').modal('show');
                                        $('#modal_model_show_times').modal('show');
                                    });
                                }
                            },
                            error: function(){
                                $('#modal_model_show_times').modal('hide');
                                $('#modal_model_update').modal('hide');
                                swal({
                                    title: "<span style='color:red;'>Error!</span>",
                                    text: "There was an error trying to search availables showtimes for the action!<br>The request could not be sent to the server.",
                                    html: true,
                                    type: "error"
                                },function(){
                                    $('#modal_model_update').modal('show');
                                    $('#modal_model_show_times').modal('show');
                                });
                            }
                        });
                    }
                    else
                    {
                        $('#modal_model_show_times').modal('hide');
                        $('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "You must select a valid time for the event(s)",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_times').modal('show');
                        });
                    }
                }
                else
                {
                    $('#modal_model_show_times').modal('hide');
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "You must select a valid date range for the event(s)",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                        $('#modal_model_show_times').modal('show');
                    });
                }
            }
            else
            {
                $('#modal_model_show_times').modal('hide');
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must select at least a week day for the event(s)",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_times').modal('show');
                });
            }
        });
        $('#btn_model_show_time_edit').on('click', function(ev) {
            $('#form_model_show_times').trigger('reset');
            $('#tb_show_times').empty();
            $('#form_model_show_times input[name="action"]:hidden').val('0').trigger('change');
            $('#subform_show_times').css('display','block');
            $('#modal_model_show_times').modal('show');
        });
        $('#btn_model_show_time_delete').on('click', function(ev) {
            $('#form_model_show_times').trigger('reset');
            $('#tb_show_times').empty();
            $('#form_model_show_times input[name="action"]:hidden').val('-1').trigger('change');
            $('#subform_show_times').css('display','none');
            $('#modal_model_show_times').modal('show');
        });
        //show_time_to
        $('#show_time_to').datetimepicker({
            autoclose: true,
            isRTL: App.isRTL(),
            format: "yyyy-mm-dd hh:ii",
            pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
            todayBtn: true,
            minuteStep: 1,
            defaultDate:'now'
        });
        //move show modal load shotimes
        $('#btn_model_show_time_change').on('click', function(ev) {
            $('#tb_show_times_dependences').empty();
            $('#form_model_show_times_move').trigger('reset');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/showtimes',
                data: {action:'cc_show_times',show_id:$('#form_model_update [name="id"]').val()},
                success: function(data) {
                    if(data.success)
                    {
                        $('#form_model_show_times_move select[name="show_time_id"]').html('<option selected disabled value=""></option>');
                        $.each(data.showtimes,function(k, s) {
                            var date = moment(s.show_time);
                            $('#form_model_show_times_move select[name="show_time_id"]').append('<option value="'+s.id+'">'+date.format('MM/DD/YYYY h:mma')+'</option>');
                        });
                        $('#modal_model_show_times_move').modal('show');
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the showtime's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //on select showtimes date change
        $('#form_model_show_times_move select[name="show_time_id"]').on('change', function(ev) {
            var show_time_id = $(this).val();
            if(show_time_id)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/showtimes',
                    data: {action:'cc_show_time_info',show_time_id:show_time_id},
                    success: function(data) {
                        if(data.success)
                        {
                            $('#tb_show_times_dependences').empty();
                            $.each(data.consignments,function(k, c) {
                                var date = moment(c.created);
                                $('#tb_show_times_dependences').append('<tr><td>Consignment</td><td>'+c.id+'</td><td>'+date.format('MM/DD/YYYY h:mma')+'</td></tr>');
                            });
                            $.each(data.purchases,function(k, p) {
                                var date = moment(p.created);
                                $('#tb_show_times_dependences').append('<tr><td>Purchase</td><td>'+p.id+'</td><td>'+date.format('MM/DD/YYYY h:mma')+'</td></tr>');
                            });
                        }
                        else{
                            $('#modal_model_show_times_move').modal('hide');
			    $('#modal_model_update').modal('hide');
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_times_move').modal('show');
                            });
                        }
                    },
                    error: function(){
                        $('#modal_model_show_times_move').modal('hide');
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to get the showtime's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_times_move').modal('show');
                        });
                    }
                });
            }
            else
            {
                $('#modal_model_show_times_move').modal('hide');
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must select a valid showtime!",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_times_move').modal('show');
                });
            }
        });
        //function submit move show_times
        $('#submit_model_show_times_move').on('click', function(ev) {
            $('#modal_model_show_times_move').modal('hide');
            $('#modal_model_update').modal('hide');
            swal({
                title: "Moving event",
                text: "Please, wait.",
                type: "info",
                showConfirmButton: false
            });
            var show_time_id = $('#form_model_show_times_move select[name="show_time_id"]').val();
            var show_time_to = $('#form_model_show_times_move input[name="show_time_to"]').val();
            var show_id = $('#modal_model_update [name="id"]:hidden').val();
            var send_email = ($('#form_model_show_times_move .make-switch:checkbox[name="send_email"]').bootstrapSwitch('state'))? 1 : 0;
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/showtimes',
                data: {action:'move',show_time_id:show_time_id,show_time_to:show_time_to,show_id:show_id,send_email:send_email},
                success: function(data) {
                    if(data.success)
                    {
                        $('#modal_model_update').modal('show');
                        if(data.id && data.showtime)
                        {
                            calendarShowTimes.fullCalendar('removeEvents',data.id);
                            fn_show_times(data.showtime);
                        }
                        swal({
                            title: "<span style='color:green;'>Saved!</span>",
                            text: data.msg,
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#btn_model_show_time_change').trigger('click');
                        });
                    }
                    else{
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_times_move').modal('show');
                        });
                    }
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to move the showtime!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                        $('#modal_model_show_times_move').modal('show');
                    });
                }
            });
        });
        //function submit show_times
        $('#submit_model_show_times').on('click', function(ev) {
            if($('#tb_show_times input[name="showtime[]"]:hidden').length)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/showtimes',
                    data: $('#form_model_show_times').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            if(data.showtimes && data.showtimes.length)
                            {
                                //loop all
                                $.each(data.showtimes,function(k, v) {
                                    //delete
                                    if(data.action ==-1)
                                    {
                                        calendarShowTimes.fullCalendar('removeEvents',v);
                                    }
                                    //update
                                    else if(data.action ==0)
                                    {
                                        calendarShowTimes.fullCalendar('removeEvents',v.id);
                                    }
                                    //add or update
                                    if(data.action >= 0)
                                    {
                                        fn_show_times(v);
                                    }
                                });
                            }
                            $('#modal_model_show_times').modal('hide');
                        }
                        else{
                            $('#modal_model_show_times').modal('hide');
                            $('#modal_model_update').modal('hide');
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_times').modal('show');
                            });
                        }
                    },
                    error: function(){
                        $('#modal_model_show_times').modal('hide');
                        $('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the showtime's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_times').modal('show');
                        });
                    }
                });
            }
            else
            {
                $('#modal_model_show_times').modal('hide');
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You have not showtimes availables to save",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_times').modal('show');
                });
            }
        });
        //function with show_times  *****************************************************************************************************   SHOW TIMES END
        //function with show_contracts  *************************************************************************************************   SHOW CONTRACTS BEGIN
        //on select ticket
        $('#form_model_show_contracts select[name="ticket_id"]').on('change', function(ev) {
            $('#btn_show_contracts_ticket_add').prop('disabled',true);
            var ticket_id = $(this).val();
            if(ticket_id)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/contracts',
                    data: {ticket_id:ticket_id},
                    success: function(data) {
                        if(data.success)
                        {
                            for(var key in data.ticket)
                            {
                                //fill out
                                var e = $('#form_model_show_contracts [name="'+key+'"]');
                                if(e.is('input:checkbox'))
                                    $('#form_model_show_contracts .make-switch:checkbox[name="'+key+'"]').bootstrapSwitch('state', (data.ticket[key]>0)? true : false, true);
                                else
                                    e.val(data.ticket[key]);
                            }
                            $('#btn_show_contracts_ticket_add').prop('disabled',false);
                        }
                        else{
                            $('#modal_model_show_contracts').modal('hide');
			    $('#modal_model_update').modal('hide');
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_contracts').modal('show');
                            });
                        }
                    },
                    error: function(){
                        $('#modal_model_show_contracts').modal('hide');
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to get the ticket's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_contracts').modal('show');
                        });
                    }
                });
            }
            else
            {
                $('#modal_model_show_contracts').modal('hide');
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must select a valid ticket!",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_contracts').modal('show');
                });
            }
        });
        //function add tickets
        $('#btn_show_contracts_ticket_add').on('click', function(ev) {
            var ticket_id = $('#form_model_show_contracts select[name="ticket_id"]').val();
            if(ticket_id)
            {
                var array = {};
                $.each($('#form_model_show_contracts').find(':input:not(.not_included)').serializeArray(), function(i, obj) { array[obj.name] = obj.value });
                var ticket_tr = '<td>'+JSON.stringify(array,null,1)+'</td><td><input type="hidden" class="not_included" value=\''+JSON.stringify(array)+'\' name="tickets[]"><input type="button" value="X" class="btn sbold bg-red"></td>';
                if($('#contracts_ticket_id_'+ticket_id).length)
                    $('#contracts_ticket_id_'+ticket_id).html(ticket_tr);
                else
                    $('#tb_show_contracts_tickets').append('<tr id="contracts_ticket_id_'+ticket_id+'">'+ticket_tr+'</tr>');
            }
            else
            {
                $('#modal_model_show_contracts').modal('hide');
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You have to select a valid ticket.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_contracts').modal('show');
                });
            }
        });
        //show contracts tickets remove
        $('#tb_show_contracts_tickets').on('click', 'input[type="button"]', function(e){
            $(this).closest('tr').remove();
        });
        //add
        $('#btn_model_contract_add').on('click', function(ev) {
            $('#form_model_show_contracts input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_contracts').trigger('reset');
            $('#btn_show_contracts_ticket_add').prop('disabled',true);
            $('#tb_show_contracts_tickets').empty();
            $('#modal_model_show_contracts').modal('show');
        });
        //view file or remove
        $('#tb_show_contracts').on('click', 'button', function(e){
            var row = $(this).closest('tr');
            var id = row.data('id');
            //remove
            if($(this).hasClass('delete'))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/contracts',
                    data: {action:-1, id:id},
                    success: function(data) {
                        if(data.success)
                        {
                            row.remove();
                        }
                        else{
			    $('#modal_model_update').modal('hide');
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
			$('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to delete the contract's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                        });
                    }
                });
            }
            //view pdf
            else
                window.open('/admin/shows/contracts/file/'+id);
        });
        //function submit show_contracts
        $('#submit_model_show_contracts').on('click', function(ev) {
            $('#modal_model_show_contracts').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_contracts').valid())
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/contracts',
                    data: new FormData($('#form_model_show_contracts')[0]),
                    cache: false,
                    contentType: false,
                    processData:false,
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            if(!data.contract.data)
                                data.contract.data = '<span class="label label-sm sbold label-warning">Nothing to run</span>';
                            else
                                data.contract.data = '<span class="label label-sm sbold label-danger">Pending</span>';
                            var updated = moment(data.contract.updated);
                            var effective_date = moment(data.contract.effective_date);
                            var row_edit = '<td><button type="button" class="btn sbold bg-blue view"><i class="fa fa-file-pdf-o"></i></button></td><td><button type="button" class="btn sbold bg-red delete"><i class="fa fa-remove"></i></button></td>';
                            $('#tb_show_contracts').prepend('<tr data-id="'+data.contract.id+'"><td>'+updated.format('MM/DD/YYYY h:mma')+'</td><td>'+effective_date.format('MM/DD/YYYY')+'</td><td>'+data.contract.data+'</td>'+row_edit+'</tr>');
                            //show modal
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_contracts').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the contract's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_contracts').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form'",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_contracts').modal('show');
                });
            }
        });
        //function with show_contracts  **************************************************************************************************   SHOW CONTRACTS END
        //function with show_images  *****************************************************************************************************   SHOW IMAGES BEGIN
        // init images
        $('#grid_show_images').cubeportfolio({
            layoutMode: 'grid',
            defaultFilter: '*',
            animationType: 'quicksand',
            gapHorizontal: 0,
            gapVertical: 0,
            gridAdjustment: 'responsive',
            mediaQueries: [{ width: 800, cols: 3 }, { width: 480, cols: 2 }, { width: 320, cols: 1 }],
            caption: 'fadeIn',
            displayType: 'default',
            displayTypeSpeed: 1,
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
            singlePageDelegate: '.cbp-singlePage',
            singlePageDeeplinking: true,
            singlePageStickyNavigation: true,
            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>'
        });
        //onclose preview show modal
        $(document).on('click', 'div.cbp-popup-close', function(){
            $('#modal_model_update').modal('show');
        });
        //fn fill out images
        var fn_show_images = function(image)
        {
            if(!image.caption) image.caption = '';
            return  '<div class="cbp-item '+image.image_type+' image_'+image.id+'" style="padding:5px"><div class="cbp-caption" style="width:290px;"><div class="cbp-caption-defaultWrap"><img src="'+image.url+'" alt="'+image.url+'"></div>'+
                    '<div class="cbp-caption-activeWrap"><div class="cbp-l-caption-alignCenter"><div class="cbp-l-caption-body">'+
                    '</div></div></div></div>'+
                    '<center><a class="cbp-l-caption-buttonLeft btn yellow uppercase edit" rel="'+image.id+'"><i class="fa fa-edit"></i></a>'+
                    '<a class="cbp-l-caption-buttonLeft btn red uppercase delete" rel="'+image.id+'"><i class="fa fa-remove"></i></a>'+
                    '<a href="'+image.url+'" class="cbp-lightbox cbp-l-caption-buttonRight btn green uppercase" onclick="$(\'#modal_model_update\').modal(\'hide\');" data-title="'+image.image_type+'<br>'+image.caption+'"><i class="fa fa-search"></i></a>'+
                    '</center><div class="cbp-l-grid-projects-title uppercase text-center">'+image.image_type+'</div>'+
                    '<div class="cbp-l-grid-projects-desc text-center">'+(image.caption.substr(0,47)+'...')+'</div>'+
                    '</div>';
        };
        //add
        $('#btn_model_image_add').on('click', function(ev) {
            $('#form_model_show_images').trigger('reset');
            $('#form_model_show_images input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_images input[name="action"]:hidden').val('1').trigger('change');
            $('#form_model_show_images input[name="url"]:hidden').val('').trigger('change');
            $('#form_model_show_images img[name="url"]').attr('src','');
            $('#subform_show_images').css('display','block');
            $('#modal_model_show_images').modal('show');
        });
        //edit
        $(document).on('click', '#grid_show_images a.edit', function(){
            var id = $(this).attr('rel');
            $('#form_model_show_images').trigger('reset');
            $('#form_model_show_images input[name="id"]:hidden').val(id).trigger('change');
            $('#form_model_show_images input[name="action"]:hidden').val('0').trigger('change');
            $('#form_model_show_images input[name="url"]:hidden').val('').trigger('change');
            $('#form_model_show_images img[name="url"]').attr('src','');
            $('#subform_show_images').css('display','none');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/images',
                data: {id:id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#form_model_show_images [name="caption"]').val(data.image.caption);
                        $('#form_model_show_images [name="image_type"]').val(data.image.image_type);
                        $('#modal_model_show_images').modal('show');
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the image's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //remove
        $(document).on('click', '#grid_show_images a.delete', function(){
            var id = $(this).attr('rel');
            var show_id = $('#form_model_show_images [name="show_id"]:hidden').val();
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/images',
                data: {action:-1,id:id,show_id:show_id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#grid_show_images .image_'+id).remove();
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to delete the image's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //function submit images
        $('#submit_model_show_images').on('click', function(ev) {
            $('#modal_model_show_images').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_images [name="action"]').val()=='0' || ($('#form_model_show_images [name="action"]').val()=='1' && $('#form_model_show_images [name="url"]').attr('src')!=''))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/images',
                    data: $('#form_model_show_images').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            //delete or update
                            if(data.action <= 0)
                            {
                                var id = $('#form_model_show_images [name="id"]:hidden').val();
                                $('#grid_show_images .image_'+id).remove();
                            }
                            //add or update
                            if(data.action >= 0)
                            {
                                var html = fn_show_images(data.image);
                                $('#grid_show_images').cubeportfolio('appendItems', html);
                                $('#grid_show_images').trigger('resize.cbp');
                            }
                            //show modal
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_images').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the image's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_images').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_images').modal('show');
                });
            }
        });
        //function load form to upload image
        $('#btn_shows_upload_images').on('click', function(ev) {
            var type = $('#form_model_show_images [name="image_type"]').val().toLowerCase();
            FormImageUpload('images.'+type,'#modal_model_show_images','#form_model_show_images [name="url"]');
        });
        //function with show_images  *****************************************************************************************************   SHOW IMAGES END
        //function with show_banners  ****************************************************************************************************   SHOW BANNERS BEGIN
        // init banners
        $('#grid_show_banners').cubeportfolio({
            layoutMode: 'grid',
            defaultFilter: '*',
            animationType: 'quicksand',
            gapHorizontal: 0,
            gapVertical: 0,
            gridAdjustment: 'responsive',
            mediaQueries: [{ width: 800, cols: 3 }, { width: 480, cols: 2 }, { width: 320, cols: 1 }],
            caption: 'fadeIn',
            displayType: 'default',
            displayTypeSpeed: 1,
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
            singlePageDelegate: '.cbp-singlePage',
            singlePageDeeplinking: true,
            singlePageStickyNavigation: true,
            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>'
        });
        //fn fill out banners
        var fn_show_banners = function(image)
        {
            if(!image.type) image.type = '';
            if(!image.url)
            {
                image.url = '';
                var link = '';
            }
            else
                var link = '<a href="'+image.url+'" target="_blank">'+(image.url.substr(0,47)+'...')+'</a>';
            return  '<div class="cbp-item banner_'+image.id+'" style="padding:5px"><div class="cbp-caption" style="width:290px;"><div class="cbp-caption-defaultWrap"><img src="'+image.file+'" alt="'+image.file+'"></div>'+
                    '<div class="cbp-caption-activeWrap"><div class="cbp-l-caption-alignCenter"><div class="cbp-l-caption-body">'+
                    '</div></div></div></div>'+
                    '<center><a class="cbp-l-caption-buttonLeft btn yellow uppercase edit" rel="'+image.id+'"><i class="fa fa-edit"></i></a>'+
                    '<a class="cbp-l-caption-buttonLeft btn red uppercase delete" rel="'+image.id+'"><i class="fa fa-remove"></i></a>'+
                    '<a href="'+image.file+'" class="cbp-lightbox cbp-l-caption-buttonRight btn green uppercase" onclick="$(\'#modal_model_update\').modal(\'hide\');" data-title="'+image.type+'<br>'+image.url+'"><i class="fa fa-search"></i></a>'+
                    '</center><div class="cbp-l-grid-projects-desc uppercase text-center"><b>'+(image.type.substr(0,38)+'...')+'</b></div>'+
                    '<div class="cbp-l-grid-projects-desc text-center">'+link+'</div>'+
                    '</div>';
        };
        //add
        $('#btn_model_banner_add').on('click', function(ev) {
            $('#form_model_show_banners').trigger('reset');
            $('#form_model_show_banners input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_banners input[name="action"]:hidden').val('1').trigger('change');
            $('#form_model_show_banners input[name="file"]:hidden').val('').trigger('change');
            $('#form_model_show_banners img[name="file"]').attr('src','');
            $('#subform_show_banners').css('display','block');
            $('#modal_model_show_banners').modal('show');
        });
        //edit
        $(document).on('click', '#grid_show_banners a.edit', function(){
            var id = $(this).attr('rel');
            $('#form_model_show_banners').trigger('reset');
            $('#form_model_show_banners input[name="id"]:hidden').val(id).trigger('change');
            $('#form_model_show_banners input[name="action"]:hidden').val('0').trigger('change');
            $('#form_model_show_banners input[name="file"]:hidden').val('').trigger('change');
            $('#form_model_show_banners img[name="file"]').attr('src','');
            $('#subform_show_banners').css('display','none');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/banners',
                data: {id:id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#form_model_show_banners [name="url"]').val(data.banner.url);
                        if(data.banner.type && data.banner.type!='')
                        {
                            data.banner.type = data.banner.type.split(',');
                            $.each(data.banner.type,function(k, t) {
                                $('#form_model_show_banners :checkbox[value="'+t+'"]').prop('checked',true);
                            });
                        }
                        $('#modal_model_show_banners').modal('show');
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the banner's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //remove
        $(document).on('click', '#grid_show_banners a.delete', function(){
            var id = $(this).attr('rel');
            var show_id = $('#form_model_show_banners [name="parent_id"]:hidden').val();
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/banners',
                data: {action:-1,id:id,parent_id:show_id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#grid_show_banners .banner_'+id).remove();
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to delete the banner's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //function submit banners
        $('#submit_model_show_banners').on('click', function(ev) {
            $('#modal_model_show_banners').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_banners [name="action"]').val()=='0' || ($('#form_model_show_banners [name="action"]').val()=='1' && $('#form_model_show_banners [name="file"]').attr('src')!=''))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/banners',
                    data: $('#form_model_show_banners').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            //delete or update
                            if(data.action <= 0)
                            {
                                var id = $('#form_model_show_banners [name="id"]:hidden').val();
                                $('#grid_show_banners .banner_'+id).remove();
                            }
                            //add or update
                            if(data.action >= 0)
                            {
                                var html = fn_show_banners(data.banner);
                                $('#grid_show_banners').cubeportfolio('appendItems', html);
                                $('#grid_show_banners').trigger('resize.cbp');
                            }
                            //show modal
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_banners').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the banner's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_banners').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_banners').modal('show');
                });
            }
        });
        //function load form to upload banners
        $('#btn_shows_upload_banner').on('click', function(ev) {
            FormImageUpload('banners.file','#modal_model_show_banners','#form_model_show_banners [name="file"]');
        });
        //function with show_banners  ****************************************************************************************************   SHOW IMAGES END
        //function with show_videos  *****************************************************************************************************   SHOW VIDEOS BEGIN
        // init videos
        $('#grid_show_videos').cubeportfolio({
            layoutMode: 'grid',
            defaultFilter: '*',
            animationType: 'quicksand',
            gapHorizontal: 0,
            gapVertical: 0,
            gridAdjustment: 'responsive',
            mediaQueries: [{ width: 800, cols: 3 }, { width: 480, cols: 2 }, { width: 320, cols: 1 }],
            caption: 'fadeIn',
            displayType: 'default',
            displayTypeSpeed: 1,
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
            singlePageDelegate: '.cbp-singlePage',
            singlePageDeeplinking: true,
            singlePageStickyNavigation: true,
            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>'
        });
        //fn fill out videos
        var fn_show_videos = function(video)
        {
            if(!video.description) video.description = '';
            var vid = $($.parseHTML(video.embed_code)); vid.width(310); vid.height(200);
            return  '<div class="cbp-item video_'+video.id+'" style="padding:5px;width:290px;"><div class="cbp-caption"><div class="cbp-caption-defaultWrap">'+vid.prop('outerHTML')+'</div>'+
                    '<div class="cbp-caption-activeWrap"><div class="cbp-l-caption-alignCenter"><div class="cbp-l-caption-body">'+
                    '</div></div></div></div>'+
                    '<center><a class="cbp-l-caption-buttonLeft btn yellow uppercase edit" rel="'+video.id+'"><i class="fa fa-edit"></i></a>'+
                    '<a class="cbp-l-caption-buttonLeft btn red uppercase delete" rel="'+video.id+'"><i class="fa fa-remove"></i></a>'+
                    '</center><div class="cbp-l-grid-projects-title uppercase text-center">'+video.video_type+'</div>'+
                    '<div class="cbp-l-grid-projects-desc text-center">'+(video.description.substr(0,47)+'...')+'</div>'+
                    '</div>';
        };
        //add
        $('#btn_model_video_add').on('click', function(ev) {
            $('#form_model_show_videos').trigger('reset');
            $('#form_model_show_videos input[name="id"]:hidden').val('').trigger('change');
            $('#form_model_show_videos input[name="action"]:hidden').val('1').trigger('change');
            $('#form_model_show_videos input[name="file"]:hidden').val('').trigger('change');
            $('#form_model_show_videos img[name="file"]').attr('src','');
            $('#subform_show_videos').css('display','block');
            $('#modal_model_show_videos').modal('show');
        });
        //edit
        $(document).on('click', '#grid_show_videos a.edit', function(){
            var id = $(this).attr('rel');
            $('#form_model_show_videos').trigger('reset');
            $('#form_model_show_videos input[name="id"]:hidden').val(id).trigger('change');
            $('#form_model_show_videos input[name="action"]:hidden').val('0').trigger('change');
            $('#subform_show_videos').css('display','none');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/videos',
                data: {id:id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#form_model_show_videos [name="video_type"]').val(data.video.video_type);
                        $('#form_model_show_videos [name="embed_code"]').val(data.video.embed_code);
                        $('#form_model_show_videos [name="description"]').val(data.video.description);
                        $('#modal_model_show_videos').modal('show');
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to get the video's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //remove
        $(document).on('click', '#grid_show_videos a.delete', function(){
            var id = $(this).attr('rel');
            var show_id = $('#form_model_show_videos [name="show_id"]:hidden').val();
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/shows/videos',
                data: {action:-1,id:id,show_id:show_id},
                success: function(data) {
                    if(data.success)
                    {
                        $('#grid_show_videos .video_'+id).remove();
                    }
                    else
                    {
                        $('#modal_model_update').modal('hide');
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
                    $('#modal_model_update').modal('hide');
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to delete the video's information!<br>The request could not be sent to the server.",
                        html: true,
                        type: "error"
                    },function(){
                        $('#modal_model_update').modal('show');
                    });
                }
            });
        });
        //function submit videos
        $('#submit_model_show_videos').on('click', function(ev) {
            $('#modal_model_show_videos').modal('hide');
            $('#modal_model_update').modal('hide');
            if($('#form_model_show_videos [name="action"]').val()=='0' || ($('#form_model_show_videos [name="action"]').val()=='1' && $('#form_model_show_videos [name="file"]').attr('src')!=''))
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/videos',
                    data: $('#form_model_show_videos').serializeArray(),
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Saved!</span>",
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            //delete or update
                            if(data.action <= 0)
                            {
                                var id = $('#form_model_show_videos [name="id"]:hidden').val();
                                $('#grid_show_videos .video_'+id).remove();
                            }
                            //add or update
                            if(data.action >= 0)
                            {
                                var html = fn_show_videos(data.video);
                                $('#grid_show_videos').cubeportfolio('appendItems', html);
                            }
                            //show odal
                            $('#modal_model_update').modal('show');
                        }
                        else{
                            swal({
                                title: "<span style='color:red;'>Error!</span>",
                                text: data.msg,
                                html: true,
                                type: "error"
                            },function(){
                                $('#modal_model_update').modal('show');
                                $('#modal_model_show_videos').modal('show');
                            });
                        }
                    },
                    error: function(){
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to save the video's information!<br>The request could not be sent to the server.",
                            html: true,
                            type: "error"
                        },function(){
                            $('#modal_model_update').modal('show');
                            $('#modal_model_show_videos').modal('show');
                        });
                    }
                });
            }
            else
            {
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "You must fill out correctly the form.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                    $('#modal_model_show_videos').modal('show');
                });
            }
        });
        //function with show_videos  *****************************************************************************************************   SHOW VIDEOS END
        //function with show_reviews  *************************************************************************************************   SHOW REVIEWS BEGIN

        //function to update table
        function update_reviews(data)
        {
            $('#tb_show_reviews').empty();
            if(data.reviews && data.reviews.length)
            {
                $.each(data.reviews,function(k, v) {
                    var check_row = '<td><label class="mt-checkbox mt-checkbox-single mt-checkbox-outline"><input type="checkbox" class="checkboxes" id="'+v.id+'" /><span></span></label></td>';
                    var posted_row = '<td><b>Name: </b>'+v.name+' ('+v.email+')';
                    var rating_row = ' <b>Rating: </b>'+v.rating+'/5 <b>Posted: </b>'+v.created;
                    var review_row = '<br><i><small>" '+v.review+' "</small></i></td>';
                    if(v.status=='Approved')
                        var status_row = '<td><span class="label label-sm label-success"><b>'+v.status+'<b></span></td>';
                    else if(v.status=='Denied')
                        var status_row = '<td><span class="label label-sm label-danger"><b>'+v.status+'<b></span></td>';
                    else
                        var status_row = '<td><span class="label label-sm label-default"><b>'+v.status+'<b></span></td>';
                    $('#tb_show_reviews').append('<tr>'+check_row+posted_row+rating_row+review_row+status_row+'</tr>');
                });
            }
        }
        //function approved or deny elements
        $('#btn_model_review_approve, #btn_model_review_deny').on('click', function(ev) {
            $('#modal_model_update').modal('hide');
            swal({
                title: "Updating review's information",
                text: "Please, wait.",
                type: "info",
                showConfirmButton: false
            });
            var status = $(this).data('status');
            var show_id = $('#form_model_update input[name="id"]').val();
            var ids = [];
            var checked = $('#tb_show_reviews input[type=checkbox]:checked');
            jQuery(checked).each(function (key, item) {
                ids.push(item.id);
            });
            if(ids.length>0)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/reviews',
                    data: {id:ids, status:status, show_id:show_id},
                    success: function(data) {
                        if(data.success)
                        {
                            swal({
                                title: "<span style='color:green;'>Updated!</span>",
                                text: data.msg,
                                html: true,
                                timer: 1500,
                                type: "success",
                                showConfirmButton: false
                            });
                            $('#modal_model_update').modal('show');
                            update_reviews(data);
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
                            text: "There was an error trying to update the review's information!<br>The request could not be sent to the server.",
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
                    text: "You must select at least one review to update.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function refresh show_reviews
        $('#btn_model_review_refresh').on('click', function(ev) {
            $('#tb_show_reviews').empty();
            var show_id = $('#form_model_update input[name="id"]').val();
            if(show_id)
            {
                jQuery.ajax({
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    type: 'POST',
                    url: '/admin/shows/reviews',
                    data: {show_id:show_id},
                    success: function(data) {
                        if(data.success)
                        {
                            update_reviews(data);
                        }
                        else{
                            $('#modal_model_update').modal('hide');
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
                        $('#modal_model_update').modal('hide');
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: "There was an error trying to load the review's information!<br>The request could not be sent to the server.",
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
                $('#modal_model_update').modal('hide');
                swal({
                    title: "<span style='color:red;'>Error!</span>",
                    text: "There is an error. Please, contact an administrator.",
                    html: true,
                    type: "error"
                },function(){
                    $('#modal_model_update').modal('show');
                });
            }
        });
        //function with show_reviews  **************************************************************************************************   SHOW REVIEWS END

        //init functions
        check_models();
        $('input[name="cutoff_hours"]').TouchSpin({ initval:1,min:-10,step:1,decimals:0,max:99 });
        $('input[name="sequence"]').TouchSpin({ initval:10000,min:1,step:1,decimals:0,max:10000 });
        $('input[name="avail_hours"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:10000 });
        $('input[name="max_tickets"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:1000 });
        $('input[name="ticket_limit"]').TouchSpin({ initval:0,min:0,step:1,decimals:0,max:999 });
        $('input[name="retail_price"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:1000000,prefix:'$' });
        $('input[name="starting_at"]').TouchSpin({ min:0.00,step:0.01,decimals:2,max:1000000,prefix:'$' });
        $('input[name="regular_price"]').TouchSpin({ min:0.00,step:0.01,decimals:2,max:1000000,prefix:'$' });
        $('input[name="processing_fee"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:1000000,prefix:'$' });
        $('input[name="percent_pf"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:100.00,postfix:'%' });
        $('input[name="percent_commission"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:100.00,postfix:'%' });
        $('input[name="fixed_commission"]').TouchSpin({ initval:0.00,min:0.00,step:0.01,decimals:2,max:100.00,prefix:'$' });
        $('#form_model_update [name="venue_id"]').trigger('change');
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
                    maxlength: 100,
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
                    maxlength: 500,
                    required: false
                },
                facebook: {
                    minlength: 5,
                    maxlength: 500,
                    required: false
                },
                twitter: {
                    minlength: 5,
                    maxlength: 500,
                    required: false
                },
                googleplus: {
                    minlength: 5,
                    maxlength: 500,
                    required: false
                },
                instagram: {
                    minlength: 5,
                    maxlength: 500,
                    required: false
                },
                yelpbadge: {
                    minlength: 5,
                    maxlength: 500,
                    required: false
                },
                url: {
                    minlength: 5,
                    maxlength: 200,
                    required: false
                },
                ext_slug: {
                    minlength: 5,
                    maxlength: 100,
                    required: false
                },
                stage_id: {
                    required: true
                },
                venue_id: {
                    required: true
                },
                category_id: {
                    required: true
                },
                logo_url: {
                    //url: true,
                    required: true
                },
                header_url: {
                    //url: true,
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
