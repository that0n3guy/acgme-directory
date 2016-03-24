// JavaScript Document
var queries_in_progress=[];

$(document).ready(function() {
	"use strict";
    $('#doit').on('click',function(){getdata();});
});

function getdata() {
	"use strict";
	
	// reset table, cancel pending queries
	$('#progtable tbody').empty();
	$.each(queries_in_progress, function(key, val) {
		// explicitly abort all queries that were called in previous function, even if already aborted
		val.abort();
	});
	queries_in_progress=[];
	
	$.ajax({
		url: 'q_proglist.php',
		type: 'GET',
		data: {
			state: $('#state').val(),
			specialty: $('#specialty').val()
		},
		dataType: "json",
		success: function(ret) {
			if (ret.length===0) {
				// no programs found
				$('#progtable').append("<tr><td colspan='3'><i>No programs found for this state/specialty</i></td></tr>");
				return;
			}
			$.each(ret, function(key, val) {
				// create new row for each program
				console.log("Searching info for prog "+val.progid);
				$('#progtable').append("<tr id='t_"+val.progid+"'><td>"+val.code+"</td><td>"+val.name+"</td></tr>");
				// query email addresses for this program
				queries_in_progress[queries_in_progress.length]=$.ajax({
					url: 'q_proginfo.php',
					type: 'GET',
					data: {
						progid: val.progid
					},
					dataType:"json",
					success: function(proginfo) {
						var row_id="#t_"+proginfo.progid;	// id for row to which cells added
						if (proginfo.email.length===0) {
							// no emails found
							$(row_id).append("<td><i>None found</i></td>");
						}
						else {
							var email_str="";
							if (proginfo.email.length>1) {
								email_str=proginfo.email.join("<br />");
							}
							else {
								email_str=proginfo.email;
							}
							$(row_id).append("<td>"+email_str+"</td>");
						}
					},
					error: function(jqXHR) {
						console.log(jqXHR.responseText);
					}
				});
			});
		},
		error: function (jqXHR) {
			console.log(jqXHR.responseText);
		}
	});
}