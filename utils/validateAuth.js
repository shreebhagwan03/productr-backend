export const validateAuth = ({ email, mobile, password }) => {
  if (!email && !mobile) {
    return "Email or mobile is required";
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return "Invalid email format";
  }

  if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
    return "Mobile number must be 10 digits";
  }

  if (!password || password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};
