(function($) {
    "use strict";

    // Options for Message
    //----------------------------------------------
    var options = {
        'btn-loading': '<i class="fa fa-spinner fa-pulse"></i>',
        'btn-success': '<i class="fa fa-check"></i>',
        'btn-error': '<i class="fa fa-remove"></i>',
        'msg-success': 'All Good! Redirecting...',
        'msg-error': 'Wrong login credentials!',
        'useAJAX': true,
    };

    // Register Form
    //----------------------------------------------
    // Validation
    $("#register-form").validate({
        rules: {
            reg_username: "required",
            reg_password: {
                required: true,
                minlength: 5
            },
            reg_password_confirm: {
                required: true,
                minlength: 5,
                equalTo: "#register-form [name=reg_password]"
            },
            reg_firstname: "required",
            reg_surname: "required"
        },
        errorClass: "form-invalid",
        errorPlacement: function(label, element) {
            if (element.attr("type") === "checkbox" || element.attr("type") === "radio") {
                element.parent().append(label); // this would append the label after all your checkboxes/labels (so the error-label will be the last element in <div class="controls"> )
            } else {
                label.insertAfter(element); // standard behaviour
            }
        }
    });

    // Form Submission
    $("#register-form").submit(function(event) {
        var thisForm = $(this);
        remove_loading(thisForm);

        var isValid = thisForm.valid();
        if (!isValid) {
            return false;
        }

        form_loading(thisForm);

        event.preventDefault();

        if (options['useAJAX'] == true) {

            var dataArray = thisForm.serializeArray();
            var data = {};
            for (var i = 0; i < dataArray.length; i++) {
                data[dataArray[i]['name']] = dataArray[i]['value'];
            }

            $.ajax({
                type: "POST",
                url: "do_register",
                data: data,
                success: function(resp) {
                    try {
                        console.log(resp);
                        if (resp.success) {
                            form_success(thisForm);
                            console.log("Success!");
                            location.href = "login";
                        } else {
                            // console.log("THIS:", $(this)); // temp
                            form_failed(thisForm, resp.err_msg);
                            // console.log(respObj.error_message); // temp
                        }
                    } catch (e) {
                        form_failed(thisForm);
                        console.log("error:", e);
                        console.log(resp);
                    }
                },
                error: function(name, err, desc) {
                    alert(desc);
                }
            });
        }
    });

    // Loading
    //----------------------------------------------
    function remove_loading($form) {
        $form.find('[type=submit]').removeClass('error success');
        $form.find('.login-form-main-message').removeClass('show error success').html('');
    }

    function form_loading($form) {
        $form.find('[type=submit]').addClass('clicked').html(options['btn-loading']);
    }

    function form_success($form) {
        $form.find('[type=submit]').addClass('success').html(options['btn-success']);
        $form.find('.login-form-main-message').addClass('show success').html(options['msg-success']);
    }

    function form_failed($form, error_message) {
        $form.find('[type=submit]').addClass('error').html(options['btn-error']);
        $form.find('.login-form-main-message').addClass('show error').html(error_message);
    }
})($);