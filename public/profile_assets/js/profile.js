/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

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

// Edit button
$('#editButton').click(function(event) {
    event.preventDefault();

    $(this).css("display", "none");
    $(".infoEditForm").css("display", "");
    $(".infoDisplay").css("display", "none");
})

// Edit form
$("#edit-form").validate({
    rules: {
        new_firstname: "required",
        new_surname: "required",
        new_country: "required"
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

// Edit form submition
$('#edit-form').submit(function(event) {
    event.preventDefault();

    var thisForm = $(this);

    var isValid = thisForm.valid();
    if (!isValid) {
        return false;
    }

    var dataArray = thisForm.serializeArray();
    var data = {};
    for (var i = 0; i < dataArray.length; i++) {
        data[dataArray[i]['name']] = dataArray[i]['value'];
    }
    console.log(data);

    $.ajax({
        type: "POST",
        url: "do_edit",
        data: data,
        success: function(resp) {
            try {
                console.log(resp);
                if (resp.success) {
                    form_success(thisForm);
                    console.log("Success!");
                    location.reload();
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
});

// Interest form submission
$('#interest-form').submit(function(event) {
    event.preventDefault();

    var thisForm = $(this);

    var isValid = thisForm.valid();
    if (!isValid) {
        return false;
    }

    var dataArray = thisForm.serializeArray();
    var data = {};
    for (var i = 0; i < dataArray.length; i++) {
        data[dataArray[i]['name']] = dataArray[i]['value'];
    }
    console.log(data);

    $.ajax({
        type: "POST",
        url: "do_edit_interest",
        data: data,
        success: function(resp) {
            try {
                console.log(resp);
                if (resp.success) {
                    form_success(thisForm);
                    console.log("Success!");
                    location.reload();
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
});

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