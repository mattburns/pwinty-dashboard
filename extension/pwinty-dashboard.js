document.addEventListener('DOMContentLoaded', function () {
	$('#get-orders-button').click(getOrders);
	$('#pwinty-id').val(localStorage.pwintyDashboardPwintyId);
	$('#pwinty-key').val(localStorage.pwintyDashboardPwintyKey);
});

function getOrders() {
	$('#error').empty();
	$('#orders').empty();
	var pwintyId = $('#pwinty-id').val();
	var pwintyKey = $('#pwinty-key').val();
	if (pwintyId && pwintyKey) {
		if ($('#save-keys').val()) {
			localStorage.pwintyDashboardPwintyId = pwintyId;
			localStorage.pwintyDashboardPwintyKey = pwintyKey;
		}
	} else {
		$('#error').html("No keys entered");
		return;
	}
	
	$.mobile.showPageLoadingMsg();
	$.ajax({
		url: $('input:radio[name=radio-env]:checked').val() + "/Orders",
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader("X-Pwinty-MerchantId", pwintyId);
			xhr.setRequestHeader("X-Pwinty-REST-API-Key", pwintyKey);
		}
	}).done(function ( orders ) {
		var columns = ['id', 'status', 'recipientName', 'address1',  'address2',  'addressTownOrCity',  'stateOrCounty',  'postalOrZipCode',  'country',  'photos' ];
		appendOrderTable(orders, columns);
	}).fail(function(error) { 
		$('#error').append("Urgh, epic fail. " + error.statusText + " " + error.responseText);
		console.log(error);
	}).always(function() {
		$.mobile.hidePageLoadingMsg();
	});
}

function cancelOrder(orderId) {
	$('#error').empty();
	$('#orders').empty();
	var pwintyId = $('#pwinty-id').val();
	var pwintyKey = $('#pwinty-key').val();
	
	$.mobile.showPageLoadingMsg();
	$.ajax({
		url: $('input:radio[name=radio-env]:checked').val() + "/Orders/Status",
		type: 'POST',
		data: {
			id: orderId,
			status: "Cancelled"
		},
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader("X-Pwinty-MerchantId", pwintyId);
			xhr.setRequestHeader("X-Pwinty-REST-API-Key", pwintyKey);
		}
	}).done(function () {
		$('#orders').append("Done");
	}).fail(function(error) { 
		$('#error').append("Urgh, epic fail. " + error.statusText + " " + error.responseText);
		console.log(error);
	}).always(function() {
		$.mobile.hidePageLoadingMsg();
	});
}

function appendOrderTable(orders, columns) {
	var tableString = '<h2>Orders</h2><table id="orders-table">';
	for (var i = 0; i < columns.length; i++) {
		tableString += '<th>' + columns[i] + '</th>';
	}
	tableString += '</tr></table>';

	$('#orders').append(tableString);
	
	$.each(orders, function() {
		appendOrderRow(this, columns);
	});
	
	$('.photo-link').click(function(){
		var jump = $(this).attr('href');
		var new_position = $('a[name=' + jump.substring(1) + ']').offset();
		window.scrollTo(new_position.left,new_position.top);
		return false;
	});
	
	$('.show-thumbs-link').click(function(){
		var id = $(this).attr('id');
		var orderId = id.substring(12);
		$('.photo-url-link-' + orderId).each(function(index) {
			$(this).html('<img width="250" src="' + $(this).attr('href') + '" />');
		});
		return false;
	});
	
	$('.cancel-order-link').click(function(){
		var id = $(this).attr('id');
		var orderId = id.substring(13);
		cancelOrder(orderId);
		return false;
	});
}

function appendOrderRow(order, columns) {
	var rowString = '<tr>';
	for (var i = 0; i < columns.length; i++) {
		if (columns[i] == 'photos') {
			if (order.photos.length > 0) {
				rowString += '<td><a class="photo-link" href="#photos-for-' + order.id + '">photos</a></td>';
				var photoColumns = ['id', 'status', 'type', 'url', 'copies', 'sizing'];
				appendPhotoTable(order.id, order.photos, photoColumns);
			} else {
				rowString += '<td>none</td>';
			}
		} else {
			rowString += '<td>' + order[columns[i]] + '</td>';
		}
	}
	if (order.status == 'NotYetSubmitted') {
		rowString += '<td><a href="#" class="cancel-order-link" id="cancel-order-' + order.id + '">Cancel Order</a></td>';
	} else {
		rowString += '<td></td>';
	}
	rowString += '</tr>';

	$('#orders-table > tbody:last').append(rowString);
}

function appendPhotoTable(orderId, photos, columns) {
	var tableString = '<a name="photos-for-' + orderId + '"><h2>Photos for Order #' + orderId + '</h2></a>';
	tableString += '<a href="#" class="show-thumbs-link" id="show-thumbs-' + orderId + '">Show thumbs</a>';
	tableString += '<table id="photos-table-' + orderId + '">';
	for (var i = 0; i < columns.length; i++) {
		tableString += '<th>' + columns[i] + '</th>';
	}
	tableString += '</tr></table>';

	$('#orders').append(tableString);
	
	$.each(photos, function() {
		appendPhotoRow(orderId, this, columns);
	});
}

function appendPhotoRow(orderId, photo, columns) {
	var rowString = '<tr>';
	for (var i = 0; i < columns.length; i++) {
		if (columns[i] == 'url') {
			rowString += '<td><a class="photo-url-link-' + orderId + '" href="' + photo[columns[i]] + '">url</a></td>';
		} else {
			rowString += '<td>' + photo[columns[i]] + '</td>';
		}
	}
	rowString += '</tr>';

	$('#photos-table-' + orderId + ' > tbody:last').append(rowString);
}

function showThumbs() {
}