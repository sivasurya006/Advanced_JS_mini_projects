import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { calculateBmiUsingApiVerse } from "../utils/bmi.js";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);


const {log} = console;


const port = 3000;
const app = express();

const API_KEY = '4bb74df6-914d-4b73-80c1-26d71e632275';

app.use(express.static(path.join(__dirName, '../public')));
app.use(express.json());

app.set('view engine','ejs');

app.listen(port,() => {
    log(`Server running on port ${port}`);
});

app.get('/',(req,res) => {
    res.render('index',{title : "Home"});
});

app.get('/about',(req,res) => {
    res.render('about',{title : 'About'});
});

app.get('/tools',(req,res) => {
    res.render('tools',{title : 'Tools'});
});

app.get('/calculate/bmi',(req,res) => {
    res.render('bmi',{title : "Calculate Your BMI"});
});

// simultaneous requests

app.post('/calculate/bmi',async (req,res) => {
    const {height, weight} = req.body || {};

    if(!height || !weight){
        return res.status(400).json({ error: 'weight and height are required' });
    }

    if(height < 0 || weight < 0){
        return res.status(400).json({error :"weight and height are must be positive"});
    }

    if(API_KEY){
        try{
            const result = await calculateBmiUsingApiVerse(API_KEY,height,weight);
            if(result.status === 'ok'){
                const data = result.data;
                if(!data){
                    throw new Error("Data field is missing");
                }
                return res.json({result : data});
            }
        }catch(err){
            log("External :",err);
            return res.status(500).json({error: err.message });
        }
    }else{
        return res.status(500).json({error: "No implementation" });
    }


});



