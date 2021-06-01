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