const rules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please provide a valid email address',
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number and one special character',
  },
  alphabetic: {
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Only alphabetic characters are allowed',
  },
  alphanumeric: {
    pattern: /^[a-zA-Z0-9\s]+$/,
    message: 'Only alphanumeric characters are allowed',
  },
  numeric: {
    pattern: /^\d+$/,
    message: 'Only numeric characters are allowed',
  },
  phone: {
    pattern: /^\+?[0-9]{10,15}$/,
    message: 'Please provide a valid phone number',
  },
};

/**
 * Validate a value against a rule
 * @param {string} value - Value to validate
 * @param {string} ruleName - Name of the rule to validate against
 * @returns {object} - Validation result {valid: boolean, message: string}
 */
const validate = (value, ruleName) => {
  const rule = rules[ruleName];
  if (!rule) {
    return { valid: false, message: 'Invalid validation rule' };
  }

  const valid = rule.pattern.test(value);
  return {
    valid,
    message: valid ? null : rule.message,
  };
};

/**
 * Validate an object against a schema
 * @param {object} data - Data to validate
 * @param {object} schema - Validation schema {field: ruleName}
 * @returns {object} - Validation result {valid: boolean, errors: object}
 */
const validateObject = (data, schema) => {
  const errors = {};
  let valid = true;

  Object.keys(schema).forEach((field) => {
    const ruleName = schema[field];
    if (data[field] === undefined || data[field] === null) {
      return; // skip if no value to validate
    }

    const validationResult = validate(data[field], ruleName);
    if (!validationResult.valid) {
      errors[field] = validationResult.message;
      valid = false;
    }
  });

  return { valid, errors };
};

module.exports = {
  rules,
  validate,
  validateObject,
};
