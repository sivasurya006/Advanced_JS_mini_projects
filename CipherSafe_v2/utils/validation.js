export function isValidSignupCredentials(name, email, password) {
    return name && password && name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;
}

export function isValidSigninCredentials(email, password) {
    return email && password && email.trim().length > 0 && password.trim().length > 0;
}
