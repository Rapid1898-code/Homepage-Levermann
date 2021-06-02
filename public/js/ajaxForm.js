$(document).ready(function () {
  $("form").submit(function (event) {
    var formData = {
      tickerRequestField: $("#tickerRequestField").val(),
    };

    $.ajax({
      type: "POST",
      url: "process.php",
      data: formData,
      dataType: "json",
      encode: true,
    }).done(function (data) {
      console.log(data);
    });

    event.preventDefault();
  });
});