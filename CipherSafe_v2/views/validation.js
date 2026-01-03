export function isValidName(name){
    if(name.length > 0){
        if(name.length <= 30){
            if((/^[a-zA-Z\\s]+$/).test(name)){
                return {
                    ok : true,
                    msg : "Valid name"    
                }
            }else{
                return {
                    ok : false,
                    msg : "name only contains letters and spaces"
                }
            }
        }else{
            return {
                ok : false,
                msg : "This large name is not allowed"
            }
        }
    }else{
        return {
            ok : false,
            msg : "name can't be empty"
        }
    }
}

export function isValidEmail(email){
    if(email.length > 0){
        if(!email.includes(" ")){
            if(email.includes("@")){
                const parts = email.split("@");
                if(parts.length === 2 && parts[1].includes(".") && parts[1].indexOf('.') != parts[1].length-1){
                    return {
                        ok: true,
                        msg: "Valid email"
                    }
                }else{
                    return {
                        ok: false,
                        msg: "Email must contain a domain"
                    }
                }
            }else{
                return {
                    ok: false,
                    msg: "Email must contain @"
                }
            }
        }else{
            return {
                ok: false,
                msg: "Email must not contain spaces"
            }
        }
    }else{
        return {
            ok: false,
            msg: "Email can't be empty"
        }
    }
}

export function isStrongPassword(password){
    if(password.length > 0){
        if(password.length >= 8){
         
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[^a-zA-Z0-9]/.test(password);

            if(hasUpper && hasLower && hasNumber && hasSpecial){
                return {
                    ok: true,
                    msg: "Strong password"
                }
            }else{
                return {
                    ok: false,
                    msg: "Password must contain uppercase, lowercase, number, and special character"
                }
            }

        }else{
            return {
                ok: false,
                msg: "Password must be at least 8 characters"
            }
        }
    }else{
        return {
            ok: false,
            msg: "Password can't be empty"
        }
    }
}

