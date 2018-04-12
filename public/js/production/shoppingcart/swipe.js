var SwipeFunctions = function () {

    var initFunctions = function () {

        //on click swipe card
        $('a[href="#tab_swipe"]').on('click', function(ev) {
            //reset form here too
            $('#modal_swipe_card').modal('show');
            $('#modal_swipe_card input[name="stripe_card"]').val('');
            $('#modal_swipe_card input[name="stripe_card"]').focus();
        });
        //on modal swipe card on click
        $('#modal_swipe_card').on('click', function(ev) {
            $('#modal_swipe_card input[name="stripe_card"]').val('');
            $('#modal_swipe_card input[name="stripe_card"]').focus();
        });
        //swipe card
        $('#modal_swipe_card input[name="stripe_card"]').blur(function (e) {
            e.preventDefault();
            $('#modal_swipe_card').modal('hide');
            $('#tab_swipe input[name="customer"]').focus();
        }).keyup(function (e) {
            if($(this).val().length>=78 && $(this).val().substr($(this).val().length-1)=="?")
            {
                if(valid_swipe_credit_card($(this).val()))
                {
                    $('#modal_swipe_card').modal('hide');
                    $('#tab_swipe input[name="customer"]').focus();
                }
            }
        });
        //event to check swipe
        function valid_swipe_credit_card(card_data)
        {
            var card_tracks = card_data.split("?");
            var valid_track1 = /^%B[^\^\W]{0,19}\^[^\^]{2,26}\^\d{4}\w{3}[^?]+\?\w?$/.test(card_tracks[0]+'?');
            var valid_track2 = /;[^=]{0,19}=\d{4}\w{3}[^?]+\?\w?/.test(card_tracks[1]+'?');
            if(valid_track1 || valid_track2)
            {
                var details1 = card_data.split("^");
                var card_number = details1[0];
                card_number = card_number.substring(2);
                if(details1[1].trim()=='')
                {
                    alert('That credit card has no client name on it.');
                    return false;
                }
                var names = details1[1].split("/");
                var first_name = names[1].trim();
                var last_name = names[0].trim();
                var details2 = details1[2].split(";");
                details2 = details2[1].split("=");
                var exp_date = details2[1];
                exp_date = exp_date.substring(0, exp_date.length - 1);
                var month = exp_date.substring(2, 4);
                var year = exp_date.substring(0, 2);
                $('#tab_swipe input[name="UMmagstripe"]').val(card_data);
                $('#tab_swipe input[name="customer"]').val(first_name + ' ' + last_name);
                $('#tab_swipe input[name="card"]').val(card_number);
                $('#tab_swipe input[name="month"]').val(month);
                $('#tab_swipe input[name="year"]').val(year);
                return true;
            }
            else {
                alert('Could not be correctly read the card.');
                return false;
            }
        }

    }
    return {
        //main function to initiate the module
        init: function () {
            initFunctions();
        }
    };
}();
//*****************************************************************************************
var SwipeValidation = function () {
    // advance validation
    var handleValidation = function() {
        // for more info visit the official plugin documentation:
        // http://docs.jquery.com/Plugins/Validation
            var form = $('#form_swipe');
            var error = $('.alert-danger', form);
            var success = $('.alert-success', form);
            form.validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block help-block-error', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: "", // validate all fields including form hidden input
                rules: {
                    email: {
                        minlength: 8,
                        maxlength: 200,
                        email: true,
                        required: true
                    },
                    customer: {
                        minlength: 2,
                        maxlength: 100,
                        required: true
                    },
                    phone: {
                        minlength: 10,
                        maxlength: 10,
                        digits: true,
                        required: false
                    },
                    card: {
                        minlength: 16,
                        maxlength: 16,
                        creditcard: true,
                        digits: true,
                        required: true
                    },
                    month: {
                        range: [1,12],
                        digits: true,
                        required: true
                    },
                    year: {
                        minlength: 2,
                        maxlength: 4,
                        digits: true,
                        required: true
                    },
                    UMmagstripe: {
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
    SwipeFunctions.init();
    SwipeValidation.init();
});
