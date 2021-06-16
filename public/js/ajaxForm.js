function resetForm(id) {
  $('#' + id).val(function() {
      return this.defaultValue;
  });
}

$(document).ready(function () {
  $(".needs-validation").submit(function(event) {
    event.preventDefault();
    $("#tickerRequestField").removeClass("is-invalid");
    $("#tickerRequestField").removeClass("is-valid");
    let formData = {
      tickerRequestField: $("#tickerRequestField").val(),
      tickerReqMail: $("#tickerReqMail").is(':checked')
    };

    $.ajax({
      type: "POST",
      url: "/post/tickerRequest",
      data: formData,
      dataType: "json",
      encode: true,
    }).done(function (data) {
      if (!data.success) {
        if (data.errors.name) {
          $("#tickerRequestField").addClass("is-invalid");
          $("#tickerLabel").append(
            '<div class="help-block alert-danger">' + "Pls enter ticker...!" + "</div>"
          );
        }
        setTimeout(
          function(){
            $("#tickerRequestField").removeClass("is-invalid");
            $(".help-block").remove();                           
          }, 
          3000
        );        
      } else {
        // $("#myForm")[0].reset();
        resetForm("tickerRequestField")
        $("#tickerRequestField").addClass("is-valid");
        $("#myForm").addClass("is-valid");

        $("#tickerLabel").append(
          '<div class="help-block alert-success">' + "Ticker added to Queue...!" + "</div>"
        );
        setTimeout(
          function(){
            $("#tickerRequestField").removeClass("is-valid");
            $(".help-block").remove();                           
          }, 
          3000
        );        
      } 
    });
    event.preventDefault();
  });
});