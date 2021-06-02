$(document).ready(function () {
  $("form").submit(function (event) {
    $("#tickerRequestField").removeClass("is-invalid");
    $("#tickerRequestField").removeClass("is-valid");
    var formData = {
      tickerRequestField: $("#tickerRequestField").val(),
    };

    $.ajax({
      type: "POST",
      url: "/post/tickerRequest",
      data: formData,
      dataType: "json",
      encode: true,
    }).done(function (data) {
      console.log(`DEBUG data ${data}`);

      if (!data.success) {
        if (data.errors.name) {
          $("#tickersRequestField").addClass("is-invalid");
          $("#tickersRequestField").append(
            '<div class="help-block text-danger">' + data.errors.name + "</div>"
          );
        }
      } else {
        $("#myForm")[0].reset();
        $("#tickersRequestField").addClass("is-valid");
        $("#tickersRequestField").append(
          '<div class="help-block text-success">' + "Success!" + "</div>"
        );
        setTimeout(
          function(){
            $("#tickersRequestField").removeClass("is-valid");
            $(".help-block").remove();                           
          }, 
          5000
        );        
      } 
    });
    event.preventDefault();
  });
});