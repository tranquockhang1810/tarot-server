// Validate Email
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
}

// Validate Length
const validateLength = (value, length) => {
  return value.length === length;
}

const validateMinLength = (value, min) => {
  return value.length >= min;
}

const validateMaxLength = (value, max) => {
  return value.length <= max;
}

const validateBirthDate = (birthDate) => {
  if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return birthDate < today;
};

module.exports = {
  validateEmail,
  validateLength,
  validateMinLength,
  validateMaxLength,
  validateBirthDate
}