import express from "express";
import data from '../data.json' with { type: 'json' };


const PORT = 3000;
const app = express();

const {log} = console;

app.set('view engine','ejs');
app.use(express.static('public'));

app.listen(PORT,() => {                      
    log(`Server running on port ${PORT}`);
});

const paths = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
const colors = ["#419EBB","#EDA249","#6D2ED5","#D14C32","#D83A34","#CD5120","#1EC1E2","#2D68F0"];

app.get('/:planetName{/:name}',(req,res) => {
    const index = paths.indexOf(req.params.planetName);
    res.render('index',{title:"Mercury", data : data[index] || data[0],color : {navColor: colors[index] || "#419EBB"}});
})
