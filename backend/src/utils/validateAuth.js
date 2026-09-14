const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const STUDENT_ID_PATTERN = /^[A-Za-z0-9/-]{3,20}$/;

const allowedGenders = ['Male', 'Female', 'Other'];

const isBlank = (value) => {
  return value === undefined || value === null || String(value).trim() === '';
};

const validateStudentRegister = (body) => {
  const errors = [];

  if (isBlank(body.name)) {
    errors.push('Full name is required.');
  }

  if (isBlank(body.email) || !EMAIL_PATTERN.test(String(body.email).trim())) {
    errors.push('A valid email address is required.');
  }

  if (isBlank(body.password) || String(body.password).length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (body.password !== body.confirmPassword) {
    errors.push('Password and confirm password must match.');
  }

  if (isBlank(body.studentId) || !STUDENT_ID_PATTERN.test(String(body.studentId).trim())) {
    errors.push('A valid student ID is required.');
  }

  if (isBlank(body.department)) {
    errors.push('Department is required.');
  }

  const year = Number(body.year);
  if (!Number.isInteger(year) || year < 1 || year > 5) {
    errors.push('Year of study must be a number between 1 and 5.');
  }

  if (isBlank(body.phone) || !PHONE_PATTERN.test(String(body.phone).trim())) {
    errors.push('Phone number must be 10 digits.');
  }

  if (!allowedGenders.includes(body.gender)) {
    errors.push('Gender must be Male, Female, or Other.');
  }

  if (body.role) {
    errors.push('Role cannot be assigned during registration.');
  }

  return errors;
};

const validateLogin = (body) => {
  const errors = [];

  if (isBlank(body.email) || !EMAIL_PATTERN.test(String(body.email).trim())) {
    errors.push('A valid email address is required.');
  }

  if (isBlank(body.password)) {
    errors.push('Password is required.');
  }

  return errors;
};

module.exports = {
  validateStudentRegister,
  validateLogin,
};
