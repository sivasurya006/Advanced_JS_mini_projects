import bcrypt from 'bcrypt' ;
import db from '../Database/database.js';

export async function updateEmail(userId, newEmail){
    userId = uuidToBuffer(userId);
    const checkQuery = "select id from users where email=?";
    const updateQuery = "update users set email=? where id=?";
    try{
        const accExists = await new Promise((resolve,reject)=>{
            db.query(checkQuery,[newEmail],(err,res)=>{
                if(err) return reject(err);
                resolve(res);
            });
        });

        if(accExists.length > 0){
            return { ok:false, msg:'Email already in use' };
        }

        await new Promise((resolve,reject)=>{
            db.query(updateQuery,[newEmail,userId],(err)=>{
                if(err) reject(err);
                else resolve();
            });
        });

        return { ok:true, msg:'Email updated successfully' };

    }catch(err){
        throw new Error(err);
    }
}

export async function updateStoragePermission(userId, allowed){
    userId = uuidToBuffer(userId);
    const query = "update users set storage_allowed=? where id=?";
    try{
        await new Promise((resolve,reject)=>{ db.query(query,[allowed,userId],(err)=>{
                if(err) reject(err);
                else resolve();
            });
        });
        return {
            ok: true,
            msg: allowed ? 'Server storage enabled' : 'Server storage disabled'
        };

    }catch(err){
        throw new Error(err);
    }
}

export async function updatePassword(userId, currentPassword, newPassword){
    userId = uuidToBuffer(userId);
    const selectQuery = "select password_hash from users where id=?";
    const updateQuery = "update users set password_hash= ? where id=?";

    try{
        const result = await new Promise((resolve,reject)=>{
            db.query(selectQuery,[userId],(err,res)=>{
                if(err) reject(err);
                else resolve(res);
            });
        });

        if(result.length !== 1){
            return { ok:false, msg:'User not found' };
        }

        const isMatch = await bcrypt.compare(currentPassword,result[0].password_hash);

        if(!isMatch){
            return { ok:false, msg:'Current password is incorrect' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await new Promise((resolve,reject)=>{
            db.query(updateQuery,[hashedPassword,userId],(err)=>{
                if(err) reject(err);
                else resolve();
            });
        });

        return { ok:true, msg:'Password updated successfully' };

    }catch(err){
        throw new Error(err);
    }
}

function uuidToBuffer(uuid){
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}