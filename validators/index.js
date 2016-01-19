var userRules = require('./userRules');
var itemRules = require('./itemRules');

var validator = function (options, rules, requireFields) {
	var result = {
		values: {}, 
		errors: [],
	};
	if(requireFields) {
		for (var i = 0; i < requireFields.length; i++) {
			if (typeof options[requireFields[i]] === 'undefined') {
				result.errors.push({
					field: requireFields[i],
					massage: 'Wrong ' + requireFields[i]
				});
			}
		}
	}
	for (var key in options) {
		if (options.hasOwnProperty(key) && typeof options[key] !== 'undefined'){
			var validate = rules[key](options[key]);
			
			if (!validate.error) {
				result.values[key] = validate.value;
			} else {
				result.errors.push(validate.error);
			}
		}
	}

	return result;
};

module.exports.userValidator = function(options, requireFields) {
 return validator(options, userRules, requireFields);
};

module.exports.itemValidator = function(options, requireFields) {
 return validator(options, itemRules, requireFields);
};