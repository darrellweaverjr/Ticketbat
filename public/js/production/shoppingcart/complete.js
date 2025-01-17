var CompleteFunctions = function () {

    var initFunctions = function () {

        $(window).bind('beforeunload', function(e){
            if(!($('#btn_receipt_print').length>0))
                return "Are you sure you want to leave this page? This page will allow you to print your tickets.";
        });

        //on resend email welcome
        $('#resend_welcome').on('click', function(ev) {
            var user_id = $(this).data('id');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/purchase/welcome',
                data: { user_id: user_id},
                success: function(data) {
                    if(data.success)
                    {
                        swal({
                            title: "<span style='color:green;'>Sent!</span>",
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        });
                    }
                    else
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        });
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to re-send the welcome email. Please, contact us.",
                        html: true,
                        type: "error",
                        showConfirmButton: true
                    });
                }
            });
        });

        //on resend receipts
        $('#resend_receipts').on('click', function(ev) {
            var purchases = $(this).data('purchases');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/purchase/receipts',
                data: { purchases: purchases },
                success: function(data) {
                    if(data.success && data.sent_receipts)
                    {
                        swal({
                            title: "<span style='color:green;'>Sent!</span>",
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        });
                    }
                    else
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: 'There was an error trying to re-send the receipts',
                            html: true,
                            type: "error"
                        });
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to re-send the receipts by email. Please, contact us.",
                        html: true,
                        type: "error",
                        showConfirmButton: true
                    });
                }
            });
        });
        
        //on print receipt
        $('#btn_receipt_print').on('click', function(ev) {
            var receiptWindow = window.open($(this).data('href'),'TicketBat Receipt','width=300,height=700');
            receiptWindow.print();
            receiptWindow.close();
        });

        //open links
        $(document).on('click', 'a.add_pay', function(e){
            e.preventDefault();
            var show_time = $(this).data('show_time');
            var ticket = $(this).data('ticket');
            jQuery.ajax({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                type: 'POST',
                url: '/shoppingcart/add',
                data: {show_time_id:show_time, ticket_id:ticket, qty:1},
                success: function(data) {
                    if(data.success)
                    {
                        ShoppingcartQtyItems.init();
                        Countdown.reset();
                        swal({
                            title: "<span style='color:green;'>Added to the cart!</span>",
                            text: data.msg,
                            html: true,
                            timer: 1500,
                            type: "success",
                            showConfirmButton: false
                        },function(){
                            window.open('/shoppingcart/viewcart','_self');
                        });
                    }
                    else{
                        swal({
                            title: "<span style='color:red;'>Error!</span>",
                            text: data.msg,
                            html: true,
                            type: "error"
                        });
                    }
                },
                error: function(){
                    swal({
                        title: "<span style='color:red;'>Error!</span>",
                        text: "There was an error trying to add the ticket(s) to the cart.",
                        html: true,
                        type: "error"
                    });
                }
            });
        });

        //check for broken images to change
        function check_images(){
            $('#myBanners .cbp-item.filtered:not(.hidden) img').each(function(){
                if((typeof this.naturalWidth != "undefined" && this.naturalWidth < 1 ) || this.readyState == 'uninitialized' || this.naturalWidth == "undefined" )
                    $(this).attr('src', $('meta[name="broken-image"]').attr('content') );
            });
        }
        //check images on load and check the location
        $(window).load(function(){
            check_images();
        });

    }
    return {
        //main function to initiate the module
        init: function () {
            initFunctions();
        }
    };
}();
//*****************************************************************************************
var GalleryImages = function () {

    var initGallery = function () {
        //banners carousel
        $('#myBanners').cubeportfolio({
            layoutMode: 'slider',
            defaultFilter: '*',
            animationType: 'fadeOut', // quicksand
            gapHorizontal: 30,
            gapVertical: 30,
            mediaQueries: [{ width: 320, cols: 1 }],
            gridAdjustment: 'responsive',
            caption: 'opacity',
            displayType: 'default',
            displayTypeSpeed: 1,
            auto:true,
            autoTimeout: 1500,
            drag:true,
            showNavigation: false,
            showPagination: false,
            rewindNav: true
        });
    }
    return {
        //main function to initiate map samples
        init: function () {
            initGallery();
        }
    };

}();
//*****************************************************************************************
jQuery(document).ready(function() {
    CompleteFunctions.init();
    GalleryImages.init();
});
