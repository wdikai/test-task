var validator = require('validator');

module.exports = {
	title: function(title) {
		var result = {};
		// var regex = new RegExp('/[A-Z][a-z]{10,60}/');
		// if (regex.test(title)) {
		if(title.length > 8){
			result.value = title;
		} else {
			result.error = {
				field: 'title',
				massage: 'Wrong title'
			};
		}
		
		return result;
	},
	price: function(price) {
		var result = {};
		if (validator.isFloat(price)) {
			result.value = price;
		} else {
			result.error = {
				field: 'price',
				massage: 'Wrong price'
			};
		}
		
		return result;
	},
	field: function(order_by) {
		var result = {};
		result.value = order_by !== 'price' ? 'createdAt' : 'price';
		return result;
	},
	type: function(order_type) {
		var result = {};
		result.value = order_type !== 'asc' ? 'desc' : 'asc';
		return result;
	}
};
