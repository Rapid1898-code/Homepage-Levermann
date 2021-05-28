// $(document).ready(function() {
//   $('#example').DataTable();
// } );

$(function() {
    $(document).ready(function() {
      $('#example').DataTable( {
        autoWidth: false,
        columnDefs: [
          { width: '10px', targets: 0 },
          { width: '100px', targets: 1 },
          { width: '10px', targets: 2 },
          { width: '10px', targets: 3 },
          { width: '1px', targets: 4 },
          { width: '100px', targets: 5 },
          { width: '200px', targets: 6 },
          { width: '100px', targets: 7 },
          { width: '1%', targets: 8 },
          { width: '10px', targets: 9 },
          { width: '1%', targets: 10 },
          { width: '10px', targets: 11 }
        ]
      } );

      // $('#example').DataTable( {
      //   select: true
      // } );
    });
  });