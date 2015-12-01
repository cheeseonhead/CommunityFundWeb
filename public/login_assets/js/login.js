(function($) {
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

    // Login Form
    //----------------------------------------------
    // Validation
    $("#login-form").validate({
        rules: {
            username: "required",
            password: "required"
        },
        errorClass: "form-invalid"
    });

    // Form Submission
    $("#login-form").submit(function(event) {
        event.preventDefault();
        var thisForm = $(this);
        remove_loading(thisForm);

        var isValid = thisForm.valid();
        if (!isValid) {
            return false;
        }

        form_loading(thisForm);


        if (options['useAJAX'] == true) {

            var dataArray = thisForm.serializeArray();
            var data = {};
            for (var i = 0; i < dataArray.length; i++) {
                data[dataArray[i]['name']] = dataArray[i]['value'];
            }

            $.ajax({
                type: "POST",
                url: "do_login",
                data: data,
                success: function(resp) {
                    try {
                        var respObj = (typeof(resp) == 'object') ? resp : JSON.parse(resp);
                        if (respObj.success) {
                            form_success(thisForm);
                            // eventRegistry.doEvent(eventRegistry.EventAjaxResponse, respObj);
                            location.reload();
                        } else {
                            form_failed(thisForm, respObj.err_msg);
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

            // Cancel the normal submission.
            // If you don't want to use AJAX, remove this
            return false;
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

    function form_failed($form, error_msg) {
        $form.find('[type=submit]').addClass('error').html(options['btn-error']);
        $form.find('.login-form-main-message').addClass('show error').html(error_msg);
    }

})($);