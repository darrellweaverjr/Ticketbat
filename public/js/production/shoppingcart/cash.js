var CashFunctions = function () {

    var initFunctions = function () {

        //on button click
        $('#form_cash button[name^="cash_"]').bind('click', function(ev) {
            var value = $(this).val();
            var cashed = $('#form_cash input[name="cashed"]').val();
            if($.isNumeric(value))
            {
                if(value=='0')
                    value = parseFloat(cashed*10).toFixed(2);
                else
                {
                    cashed = cashed.replace('.','').replace(/\b0+/g, '')+value;
                    value = (parseFloat(cashed)/100).toFixed(2);
                }
            }
            else
                value = '0.00';
            $('#form_cash input[name="cashed"]').val( value ).trigger('change');
        });

        //on change cashed
        $('#form_cash input[name="cashed"]').bind('change','click', function(ev) {
            var cashed = parseFloat($(this).val()).toFixed(2);
            if(cashed<0)
                cashed = 0;
            $('#form_cash input[name="cashed"]').val( cashed );
            calcFunctions();
        });
    }

    var calcFunctions = function () {
        //function to calculate cash
        var cashed = parseFloat($('#form_cash input[name="cashed"]').val()).toFixed(2);
        var pending = parseFloat($('#form_cash input[name="pending"]').val()).toFixed(2);
        var total = parseFloat(pending-cashed).toFixed(2);
        if(total>0)
        {
            $('#label_total').html('Due ($):');
            $('#form_cash input[name="subtotal"]').css('color','red');
        }
        else if(total<0)
        {
            $('#label_total').html('Change ($):');
            $('#form_cash input[name="subtotal"]').css('color','green');
        }
        else
        {
            $('#form_cash input[name="subtotal"]').css('color','black');
        }
        $('#form_cash input[name="subtotal"]').val(total*-1);
        $('#form_cash input[name="subtotal"]').validate();
    }

    return {
        //main function to initiate the module
        init: function () {
            initFunctions();
        },
        calculate: function () {
            calcFunctions();
        }
    };
}();
//*****************************************************************************************
var CashValidation = function () {
    // advance validation
    var handleValidation = function() {
        // for more info visit the official plugin documentation:
        // http://docs.jquery.com/Plugins/Validation
            var form = $('#form_cash');
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
                    subtotal: {
                        min: 0,
                        number: true,
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
            }).showErrors({
                "subtotal": "You must collect at least the quantity required here to proceed."
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
    CashFunctions.init();
    CashValidation.init();
});
