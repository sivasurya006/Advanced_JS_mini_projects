import db from '../Database/database.js';


export async function addFileRecord(data){
    const checkPermissionQuery = "select storage_allowed from users where id=?";
    const insertFileQuery = "insert into files (id,user_id,original_filename) values (?,?,?)";
    try{
        const perm = await new Promise((resolve,reject)=>{
            db.query(checkPermissionQuery,[uuidToBuffer(data.user_id)],(err,res)=>{
                    if(err) reject(err);
                    else resolve(res);
                }
            );
        });

        if(perm.length !== 1 || !perm[0].storage_allowed){
            return {
                ok: false,
                msg: 'Server storage is disabled'
            };
        }

        await new Promise((resolve,reject)=>{
            db.query(insertFileQuery,
                [uuidToBuffer(data.id),uuidToBuffer(data.user_id),data.original_filename],(err,res)=>{
                    if(err) reject(err);
                    else resolve(res);
                }
            );
        });

        return {
            ok: true,
            msg: 'File record added successfully'
        };

    }catch(err){
        throw new Error(err);
    }
}

export async function deleteFileRecord(fileId, userId){
    const deleteQuery ="delete from files where id= ? and user_id=?";

    try{
        const result = await new Promise((resolve,reject)=>{
            db.query(deleteQuery,[uuidToBuffer(fileId), uuidToBuffer(userId)],(err,res)=>{
                    if(err) reject(err);
                    else resolve(res);
                }
            );
        });

        if(result.affectedRows == 0){
            return {
                ok: false,
                msg: 'File not found'
            };
        }

        return {
            ok: true,
            msg: 'File deleted successfully'
        };

    }catch(err){
        throw new Error(err);
    }
}

export async function getUserFiles(userId){
    const query ="select id, original_filename, created_at from files where user_id=? order by created_at desc";
    try{
        const result = await new Promise((resolve,reject)=>{
            db.query(query,[uuidToBuffer(userId)],(err,res)=>{
                    if(err) reject(err);
                    else resolve(res);
                }
            );
        });
        const updatedResult = result.map(obj => ({
            ...obj,
            id: bufferToUuid(obj.id)
          }));          
        return {
            ok: true,
            files: updatedResult 
        };

    }catch(err){
        throw new Error(err);
    }
}

function uuidToBuffer(uuid){
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

function bufferToUuid(buffer) {
    const hex = buffer.toString('hex');
    return [
        hex.slice(0,8),
        hex.slice(8,12),
        hex.slice(12,16),
        hex.slice(16,20),
        hex.slice(20)
    ].join('-');
}
