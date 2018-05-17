var FilterSearchManaged = function () {

    var initFilter = function () {
        
        //showtime_date
        $('#showtime_date_input').datetimepicker({
            autoclose: true,
            isRTL: App.isRTL(),
            format: "m/dd/yyyy H:ii P",   
            pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left"),
            minuteStep: 15
        });
        //clear showtime_date
        $('#clear_onsale_date').on('click', function(ev) {
            $('#form_model_search [name="showtime_date"]').val('');
            $('#showtime_date_input').datetimepicker('update');
        });
       
        //show_times_date
        $('#show_times_date').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: 'M/DD/YYYY',
                separator: ' to '
            },
            function (start, end) {
                $('#form_model_search input[name="showtime_start_date"]').val(start.format('M/DD/YYYY'));
                $('#form_model_search input[name="showtime_end_date"]').val(end.format('M/DD/YYYY'));
            }
        );
        //clear show_times_date
        $('#clear_show_times_date').on('click', function(ev) {
            $('#form_model_search [name="showtime_start_date"]').val('');
            $('#form_model_search [name="showtime_end_date"]').val('');
            $('#show_times_date').daterangepicker('update');
        });
        //sold_times_date
        $('#sold_times_date').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                timePicker: true,
                timePickerIncrement: 1,
                format: 'M/DD/YY h:mm A',
                separator: ' to '
            },
            function (start, end) {
                $('#form_model_search input[name="soldtime_start_date"]').val(start.format('M/DD/YY h:mm A'));
                $('#form_model_search input[name="soldtime_end_date"]').val(end.format('M/DD/YY h:mm A'));
            }
        );
        //clear sold_times_date
        $('#clear_sold_times_date').on('click', function(ev) {
            $('#form_model_search [name="soldtime_start_date"]').val('');
            $('#form_model_search [name="soldtime_end_date"]').val('');
        });
        //search venue on select
        $('#form_model_search select[name="venue"]').bind('change', function() {
            var venue_id = $(this).val();
            $('#form_model_search select[name="show"]').html('<option selected value="">All</option>');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/purchases/filter',
                data: {venue_id:venue_id},
                success: function(data) {
                    if(data.success)
                    {
                        $.each(data.values,function(k, v) {
                            $('#form_model_search select[name="show"]').append('<option value="'+v.id+'">'+v.name+'</option>');
                        });
                    }
                }
            });
        });
        //search show on select
        $('#form_model_search select[name="show"]').bind('change', function() {
            var show_id = $(this).val();
            $('#form_model_search select[name="ticket"]').html('<option selected value="">All</option>');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/admin/purchases/filter',
                data: {show_id:show_id},
                success: function(data) {
                    if(data.success)
                    {
                        $.each(data.values,function(k, v) {
                            $('#form_model_search select[name="ticket"]').append('<option value="'+v.id+'">'+v.name+'</option>');
                        });
                    }
                }
            });
        });
        //function autoshow modal search
        if(parseInt($('#modal_model_search').data('modal')) > 0)
            $('#modal_model_search').modal('show');
    }
    return {
        //main function to initiate the module
        init: function () {
            if (!jQuery().dataTable) {
                return;
            }
            initFilter();
        }
    };
}();
//*****************************************************************************************
jQuery(document).ready(function() {
    FilterSearchManaged.init();
});
