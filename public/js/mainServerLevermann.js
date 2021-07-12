$(function() {
    $(document).ready(function() {
      $('#example').DataTable( {
        "ajax": "scores.txt",        
        "deferRender": true,
        autoWidth: false,
        "columns": [
          { "data": "ticker",
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html("<a href='" + "/post/" + oData.ticker + "'>" + oData.ticker + "</a>");
            }
          },
          { "data": "name" },
          { "data": "calcDate" },
          { "data": "index" },
          { "data": "currency" },
          { "data": "sector" },
          { "data": "industry" },
          { "data": "cap" },
          { "data": "finStock" },
          { "data": "score" },
          { "data": "recommend" }
        ],
        columnDefs: [
          { width: '10px', targets: 0 },
          { width: '100px', targets: 1 },
          { width: '75px', targets: 2 },
          { width: '10px', targets: 3 },
          { width: '10px', targets: 4 },
          { width: '100px', targets: 5 },
          { width: '200px', targets: 6 },
          { width: '10px', targets: 7 },
          { width: '10px', targets: 8 },
          { width: '10px', targets: 9 },
          { width: '50px', targets: 10 }
        ]
      } );

      // $('#example').DataTable( {
      //   select: true
      // } );
    });
  });