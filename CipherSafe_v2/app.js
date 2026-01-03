import express from 'express';
import 'dotenv/config'
import { fileURLToPath } from "url";
import path from "path";
import multer from 'multer';
import fs from 'fs/promises';
import {AES_encrypt} from './utils/encryption.js' ;
import { AES_decrypt } from './utils/decryption.js';
import nodemailer from 'nodemailer';
import {signin,signup} from './utils/authentication.js';
import * as validation from './utils/validation.js';
import * as uuid from 'uuid';
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"
import * as fileStorage from "./utils/filesDb.js";
import * as settings from "./utils/settingsDb.js";


const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const {log} = console;
const env = process.env;
const app = express();
const encryptedFileDest = process.env.ENCRYPTED_FILE_DEST;
const myGmail = process.env.MY_MAIL;

const transporter = nodemailer.createTransport({
    service : process.env.MAIL_SERVICE,
    auth : {
        user : process.env.MY_MAIL,
        pass : process.env.MAIL_APP_PASS
    }
}); 

// multer object creation

const upload = multer({
    storage : multer.memoryStorage(),
    fileFilter: function (req, file, callback) {
        const allowedEncryptTypes = ['.txt'];
        const allowedDecryptTypes = ['.enc'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        if ( req.path == '/encrypt' && !allowedEncryptTypes.includes(ext)) {
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE','File type not allowed'));
        }

        if ( req.path == '/decrypt' && !allowedDecryptTypes.includes(ext)) {
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE','File type not allowed'));
        }

        callback(null, true);
    },
    limits  : {
        fileSize : 4 * 1024 * 1024 
    }
});


// ====== view engine setup ============
app.set('view engine','ejs');

// ============ middlewares ===============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirName,'/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function verifyToken(req,res,next){
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/signin'); 
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.redirect('/signin');
    }
}



// ======= page rendering routers =========
app.get('/signup',(req,res) => {
    res.render('signup',{title : "Sign Up - CipherSafe"});
});

app.get('/signin', (req,res) => {
    res.render('signin',{title:"Sign In - CipherSafe"});
});

app.get('/',verifyToken, (req, res) => {
    res.render('index', { currentRoute: '/' });
});

app.get('/encrypt',verifyToken, (req, res) => {
    res.render('encrypt', { currentRoute: '/encrypt' });
});

app.get('/decrypt',verifyToken , (req, res) => {
    res.render('decrypt', { currentRoute: '/decrypt' });
});

app.get('/settings',verifyToken, (req, res) => {
    res.render('settings', { currentRoute: '/settings' , user : req.user });
});


// ========== Post API's ================

app.post('/signin' ,async (req,res) => {
    
    const {email,password} = req.body || {};

    if(!validation.isValidSigninCredentials(email,password)){
        return res.status(400).json({msg : "email and password are mandatory"});
    }

    try{

       const result = await signin({
            "email": email,
            "password": password
        })

        if(result.ok){

            const token = createToken(result.user);
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 60*60*1000 // 1hour
            });
    
            return res.status(200).json({ ok: true });
        }else{
            return res.status(401).json({
                ok : false,
                'result' : result.msg 
            });
        }

    }catch(err){
        log(err)
        return res.status(500).json({
            error : "can't sign in."
        });
    }
});


app.post('/signup', async (req,res) => {
    const {name,email,password} = req.body || {};

    if(!validation.isValidSignupCredentials(name,email,password)){
        return res.status(400).json({
            error : "name, email and password are mandatory"
        });
    }
    try{

        const result = await signup({
            "id" : uuid.v7(),
            "name" : name,
            "email": email,
            "password": password
         })
 
         if(result.ok){
            
            const token = createToken(result.user);
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 60*60*1000 // 1hour
            });

            return res.status(200).json({ ok: true });
         }else{
             return res.status(401).json({
                ok : false,
                'result' : result.msg 
             });
         }
 
     }catch(err){
         log(err)
         return res.status(500).json({
             error : "can't sign in."
         });
     }
});



app.post('/encrypt',verifyToken, upload.single('usr_file'), async (req,res) => {
    try{
        if (!req.file) {
            return res.status(400).json({ ok: false, msg: 'No file uploaded' });
        }
    
        const [chipherText,key] = AES_encrypt(req.file.buffer.toString());
        const ext = path.extname(req.file.originalname);
        const mailOption = {
            from : myGmail,
            to : req.user.email,
            subject : 'ChipherSafe',
            text : "Your Key "+key
        }
    
        transporter.sendMail(mailOption,async (err,info) => {
            if (err) {
                log(err)
                return res.status(500).json({
                    ok : false,
                    msg : 'mail not sended'
                });
            } else {
                console.log('Email sent : ' + info.response);
                log(req.user.isStorageAllowed)
                if(req.user.isStorageAllowed){
                    const id  = uuid.v7();
                    const result = await fileStorage.addFileRecord({
                        id,user_id:req.user.id,
                        original_filename : req.file.originalname
                    });
    
                    if(!result.ok){
                        return res.status(500).json({ ok: false, msg: 'Can\'t store file. Try again'});   
                    }
    
                    await fs.writeFile(encryptedFileDest+"/"+id+".enc",chipherText,'utf-8');
                    console.log('encrypted file stored');         
                }
    
                const buffer = Buffer.from(chipherText, 'utf-8');
                return res.send(buffer);
            }
        })
    }catch(err){
        log(err);
        return res.status(500).render('error');
    }
});

app.post('/decrypt',verifyToken,upload.single('usr_file'),async (req,res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, msg: 'No file uploaded' });
    }
    let { key } = req.body;
    if(!key){
        return res.status(400).json({ ok: false, msg: 'No key uploaded' });
    }

    key = key.split(',').map(val => parseInt(val,16));

    const text = AES_decrypt(req.file.buffer.toString(),key);

    const buffer = Buffer.from(text, 'utf-8');
    return res.send(buffer);
})

app.post('/update_password',verifyToken,async (req,res) => {
    try {
        const {currentPassword,password} = req.body;
        if(!currentPassword || !password){
            return res.status(400).json({ok:false, msg : "Current password and password are mandatory"});
        }

        const result = await settings.updatePassword(req.user.id,currentPassword,password);

        if(!result.ok){
            return res.status(400).json({ok:false,msg : result.msg});
        }

        return res.json({ok:true,msg:"password updated"});
    }
    catch (err) {
        console.error(err);
        return res.status(500).render('error');
    }

});

app.post('/logout',verifyToken ,(req, res) => {
    res.clearCookie('token');
});

app.get('/history', verifyToken, async (req, res) => {
    try {
        const result = await fileStorage.getUserFiles(req.user.id);
        if (!result.ok) {
            return res.render('history', {files: [] ,currentRoute: '/history'});
        }
        return res.render('history', {files: result.files,currentRoute: '/history' });
    } catch (err) {
        console.error(err);
        return res.render('history', {files: [] ,currentRoute: '/history'});
    }
});

app.post('/settings/fileStoragePermission',verifyToken,async (req,res) => {
    try{
        const {allowed} = req.body;
        log("hello given type "+allowed)
        if (typeof allowed !== "boolean") {
            return res.status(400).json({ok : false,msg : "Invalid option!"});
        }    


        if(req.user.isStorageAllowed === allowed){
            return res.json({ok : true,msg: allowed ? 'Server storage enabled' : 'Server storage disabled'});
        }

        const result = await settings.updateStoragePermission(req.user.id,allowed);
        res.clearCookie('token');
        const newToken = issueNewToken(req.user,allowed);
        res.cookie("token", newToken, {
            httpOnly: true,
            maxAge: 60*60*1000 // 1hour
        });
        return res.json({...result});
    }catch(err){
        log(err);
        return res.status(500).render('error');
    }
})

// ========= Get API 's =========
app.get('/download/file', verifyToken,async(req,res) => {
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({ok:false,msg:"Id is mandatory"});
        } 
        const result = await fileStorage.getUserFiles(req.user.id);
        let isValidRequest = false;
        let filename;
        for(let file of result.files){
            if(file.id == id){
                isValidRequest = true;
                filename = path.basename(file.original_filename, path.extname(file.original_filename)) + ".enc";
            }
        }
    
        if(!isValidRequest){
            return res.status(404).json({ok:false,msg:"File not found"});
        }
        res.download(path.join(encryptedFileDest,id+".enc"), filename, {headers: {'Content-Type': 'application/octet-stream'} }, (err) => {
            if(err) {
                log(err);
            }
        });
    }catch(err){
        return res.status(500).render('error');
    }
})

app.get('/download/check', verifyToken,async(req,res) => {
    const id = req.query.id;
    if(!id){
        return res.status(400).json({ok:false,msg:"Id is mandatory"});
    } 
    const result = await fileStorage.getUserFiles(req.user.id);
    let isValidRequest = false;
    for(let file of result.files){
        if(file.id == id){
            isValidRequest = true;
        }
    }
    if(!isValidRequest){
        return res.status(404).json({ok:false,msg:"File not found"});
    }
    try {
        await fs.access(path.join(encryptedFileDest,id+".enc"));
    } catch {
        return res.status(404).json({ ok: false, msg: 'File not found' });
    }
      
    return res.json({ok:true,msg:"File found"});
});




// ========= Starting the server ============
app.listen(env.PORT,() => {
    log(`Server started on ${env.PORT}`);
})




// =============== Helpers ==============

function issueNewToken(oldtoken,storage_allowed){
    const now = Math.floor(Date.now() / 1000); // seconds
    let remaining = oldtoken.exp - now;
    if (remaining <= 0) remaining = 1;

    log("New token allocated with " + storage_allowed);
    return jwt.sign({
            id: oldtoken.id,
            email : oldtoken.email,
            isStorageAllowed : storage_allowed,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: remaining 
        })
}

function createToken(user) {
    console.log(user)
    return jwt.sign(
        {
            id: user.id,
            name : user.name,
            email : user.email,
            isStorageAllowed : user.storage_allowed == 1 ? true : false,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}

// global route handler 
app.use(verifyToken,(req,res) => {
    res.render('pagenotfound');
})


// ============ Global error handler =========
app.use((err,req,res,next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ ok: false, msg: 'File too large' });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ ok: false, msg: 'Unexpected file' });
            default:
                return res.status(400).json({ ok: false, msg: err.message });
        }
    }else{
        console.error(err);
        return res.status(500).render('error');
    }
})



// ==========  Multer Storage setup ===================

// NOTE : I currently use memory storage.

// const storage = multer.diskStorage({
//     destination : function(req,file,callback){
//         callback(null,originalFileDest);
//     },
//     filename : function(req,file,callback){
//         const userId = 10;   // FIXME : Temp
//         const time = Date.now();
//         const ext = path.extname(file.originalname);
//         const name = path.basename(file.originalname,ext);

//         callback(null,`${name}-${userId}-${time}${ext}`);
//     }
// })



// ================= Note ===================

/**
 * NodeMailer
 *     A SMTP client for node js
 *     Node App → Nodemailer → SMTP Server → Recipient Inbox
 *     1. Create Transporter, service auth{user, app_pass} 
 *     2. Sendmail ({mail options},(err,info))
 *     
 */