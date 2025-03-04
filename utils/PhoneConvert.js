const convertToInternational = (phoneNumber) => {
  // Loại bỏ khoảng trắng, dấu chấm, dấu gạch ngang nếu có
  phoneNumber = phoneNumber.replace(/[\s.-]/g, '');

  // Kiểm tra nếu số điện thoại bắt đầu bằng 0
  if (phoneNumber.startsWith('0')) {
      return '+84' + phoneNumber.slice(1);
  }

  // Nếu số đã ở dạng quốc tế, giữ nguyên
  if (phoneNumber.startsWith('+84')) {
      return phoneNumber;
  }

  // Nếu số không hợp lệ
  return 'Invalid phone number';
}

module.exports = { convertToInternational };