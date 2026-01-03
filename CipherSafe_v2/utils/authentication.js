import db from '../Database/database.js';
import bcrypt from 'bcrypt';

export async function signup(data){
    const selectByEmailQuery = "select * from users where email=?";
    try{
       const result = await new Promise((resolve,reject) => {
            db.query(selectByEmailQuery,[data.email],(err,result) => {
                if(err){
                    return reject(err);
                }
                return resolve(result);
            });
       });

       if(result.length > 0){
            return {
                ok : false,
                msg : 'User already exists'
            }
        }else{
            const insertQuery = "insert into users (id,name,email,password_hash) values (?,?,?,?)";

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            const binaryId = uuidToBuffer(data.id);
            
            await new Promise((resolve,reject) => {
                db.query(
                    insertQuery,
                    [binaryId, data.name, data.email, hashedPassword],
                    (err,result) => {
                        if(err){
                            reject(err);
                        }else{
                            resolve(result);
                        }
                    }
                );
            })
 
            return {
                ok : true,
                user : {
                    id:data.id,
                    name : data.name,
                    email : data.email,
                    storage_allowed : 0
                },
                msg : 'Successfully signed up'
            }
        }
    }catch(err){
        throw new Error(err);
    }
}

export async function signin(data){
    const selectByEmailQuery = "select * from users where email=?";
    try{
        const result = await new Promise((resolve,reject) => {
            db.query(selectByEmailQuery,[data.email], (err,result) => {
                if(err) return reject(err);
                resolve(result);
            });
        });

        if(result.length === 1){
            const user = result[0];

            const isMatch = await bcrypt.compare(data.password, user.password_hash);
            
            const {id,name,email,created_at,storage_allowed} = user;
            if(isMatch){
                return {
                    ok : true,
                    user : {
                        id : bufferToUuid(id),
                        name,email,created_at,storage_allowed
                    },
                    msg : "Login successful"
                };
            }
        }

        return {
            ok : false,
            msg : 'Invalid UserName Or Password'
        };

    }catch(err){
        throw new Error(err);
    }
}

function uuidToBuffer(uuid) {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

function bufferToUuid(buffer) {
    const hex = buffer.toString('hex');
    return [hex.slice(0,8),hex.slice(8,12),
        hex.slice(12,16),hex.slice(16,20),
        hex.slice(20)
    ].join('-');
}