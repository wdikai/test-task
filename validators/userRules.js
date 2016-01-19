var validator = require('validator');

module.exports = {
	mail: function(mail) {
		var result = {};
		if (validator.isEmail(mail)) {
			result.value = mail;
		} else {
			result.error = {
				field: 'mail',
				massage: 'Wrong mail'
			};
		}

		return result;
	},
	phone: function(phone) {
		var result = {};
		//var regex = new RegEx('/\+380\d{2}\d{3}\d{4}/');
		//if (regex.test(phone))
		if(phone.length == 13) {
			result.value = phone;
		} else {
			result.error = {
				field: 'phone',
				massage: 'Wrong phone'
			};
		}
		
		return result;
	},
	password: function(password) {
		var result = {};
		if (password.length >= 6) {
			result.value = password;
		} else {
			result.error = {
				field: 'password',
				massage: 'Wrong password'
			};
		}
		
		return result;
	},
	name: function(name) {
		var result = {};
		if(name.length > 3){
		// var regex = new RegEx('/[A-Z][a-z]{1,20}/');
		// if (regex.test(name)) {
			result.value = name;
		} else {
			result.error = {
				field: 'name',
				massage: 'Wrong name'
			};
		}
		
		return result;
	}
};