


const question = document.getElementById("question");
const category = document.getElementById("category");
const opt1 = document.getElementById('opt1');
const opt2 = document.getElementById('opt2');
const opt3 = document.getElementById('opt3');
const opt4 = document.getElementById('opt4');
const difficulty = document.getElementById('difficulty');
const o1 = document.getElementById('o1');
const o2 = document.getElementById('o2');
const o3 = document.getElementById('o3');
const o4 = document.getElementById('o4');
const submit = document.getElementById('submit');
const currunt_ques = document.getElementById('currunt_ques');
const total_ques = document.getElementById('total_ques');
const start_quizz = document.getElementById('start_quizz');
const quizz_count = document.getElementById('quizz_count');
const quizz_category = document.getElementById('quizz_category');
const quizz_difficulty = document.getElementById('quizz_difficulty');
const quizz_type = document.getElementById('quizz_type');
const msg = document.getElementById('message');
const quizBlock = document.getElementById("quizBlock");


let option_labels = [opt1,opt2,opt3,opt4];
let option_inputs = [o1,o2,o3,o4];
let q_num;
let ques;
let response;
let count;
let isQuizActive = false;

 // ================ New Code =====================

 let timeouts = [];     // need to clearTimeout if user enter correct answer

async function call(url){
      try {
            const res = await fetch(url);  // fetch resolves here
            const data = await res.json(); // parse JSON
            if(!(data.results.length ==  0)){
                  response = data;
                  show(data);
            }  
            console.log(data);
      }catch (err) {
            quizBlock.classList.add("hide");
            msg.innerText = "Can't get question. Please Try again!";
            console.log(err)
      }
}

async function startTimer(sec){
      return new Promise((resolve) => {
            for(let i=0;i<sec;i++){
                  let to = setTimeout(() => {
                        timer.innerText = (sec-i);
                  },i*1000);
                  timeouts.push(to);
            }
            let to = setTimeout(() => {
                  timeouts = [];  // if it resolve then the stored callbacks not needed
                  resolve("Times up!");
            },sec*1000);
            timeouts.push(to);
      });
}


async function show(response) {
      if(!(q_num < count)){
            setTimeout(() => {
                  msg.innerText = "All questions are finished! Start again the Quizz.";
                  quizBlock.classList.add('hide');
            },1500);
            return;
      }
      option_inputs.forEach((opt) => {
            opt.checked = false;
      })
      ques = response.results[q_num++];
      currunt_ques.innerText = q_num;
      category.innerHTML = "Category : " + ques.category
      difficulty.innerText = "Difficulty : " + ques.difficulty;
      question.innerHTML = q_num + ") " + ques.question;

      let j = 0;
      if (ques.type === "boolean") {
            option_inputs[2].parentElement.style.display = "none";
            option_inputs[3].parentElement.style.display = "none";
            option_labels[2].parentElement.style.display = "none";
            option_labels[3].parentElement.style.display = "none";
            opt_count = 2;
      } else {
            option_inputs[2].parentElement.style.display = "inline";
            option_inputs[3].parentElement.style.display = "inline";
            option_labels[2].parentElement.style.display = "inline";
            option_labels[3].parentElement.style.display = "inline";
            opt_count = 4;
      }
      let correct_pos = Math.floor(Math.random() * opt_count);
      for (let i = 0; i < opt_count; i++) {
            if (i == correct_pos) {
                  option_inputs[i].value = ques.correct_answer;
                  option_labels[i].innerHTML = ques.correct_answer;
                  continue;
            }
            option_labels[i].innerHTML = ques.incorrect_answers[j++];
            option_inputs[i].value = ques.incorrect_answers[j];
      }
      console.log(correct_pos);
      quizBlock.classList.remove("hide");

      // Calling Timer
      await startTimer(10);
      show(response);
}

// ==========================================================

start_quizz.addEventListener('click',async () => {
      if(isQuizActive){
            // @@ Implement PopUp for Restart the Quiz;
            clearAllTimeouts();
            response = {};
      }
      isQuizActive = true;
      q_num = 0;
      // https://opentdb.com/api.php?amount=10&category=9&difficulty=hard&type=boolean
      let url = "https://opentdb.com/api.php?amount=";
      count = quizz_count.value;
      let q_category = quizz_category.value;
      let q_difficulty = quizz_difficulty.value;
      let q_type = quizz_type.value;
      msg.innerText = "";
      if(count <= 50){
            url += count;
      }else{
            msg.innerText =  "Maximum allowed questions 50!";
            return;
      }
      if (q_category !== "any"){
            url +="&category="+q_category;
      }
      if (q_difficulty !== "any"){
            url +="&difficulty="+q_difficulty;
      }
      if(q_type !== 'any'){
            url +="&type="+q_type;
      }
      console.log(url);
      banner.classList.remove('hide');
      await call(url);
      banner.classList.add('hide');
      total_ques.innerText = count;
    
});



submit.addEventListener('click',() => {
      let options = document.getElementsByName('options');
      let selected = false;
      let selectedValue;
      for(let opt of options){
            if(opt.checked){
                  selectedValue = opt.value;
                  selected = true;
                  opt.checked = false;
                  break;
            }
      }
      if(!selected){
            msg.innerText = "Select any option!";
      }else{
            if(selectedValue === ques.correct_answer){
                  msg.innerText = "Correct answer !!!";
                  clearAllTimeouts();
                  setTimeout(() => {
                        msg.innerText = "";
                  },1000);
                  show(response);
            }else{
                  msg.innerText = "Wrong answer !!!";
                  setTimeout(() => {
                        msg.innerText = "";
                  }, 1000);
            }
      }
});


function clearAllTimeouts(){
      timeouts.forEach((to) => {
            clearTimeout(to);      // Clear the TimeOut functions 
            console.log(to);
      });
}