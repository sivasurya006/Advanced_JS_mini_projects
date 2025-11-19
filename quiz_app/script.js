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
let responce;
let count;




// I create new object
const xhr = new XMLHttpRequest();

// Open a XMLHttpRequest();
function call(url){
      xhr.open("GET", url); // default is true
      // send() the request
      xhr.send();

      xhr.onload = function () {
          if (xhr.status === 200) {
            responce = JSON.parse(xhr.responseText);
            if (responce.response_code !== 1){
                  show(responce);
            }else{
                  quizBlock.classList.add("hide");
                  console.log(responce.response_code);
                  msg.innerText = "Can't get question. Please Try again!";
            }
           } else {
                  quizBlock.classList.add("hide");
                  msg.innerText = "error "+xhr.status;
            }
      }
}

function show(response) {
      ques = response.results[q_num++];
      currunt_ques.innerText = q_num;
      category.innerHTML = "Category : " + ques.category
      difficulty.innerText = "Difficulty : " + ques.difficulty;
      question.innerHTML = q_num + ") " + ques.question;

      let j = 0;
      if (ques.type === "boolean") {
            option_inputs[2].style.display = "none";
            option_inputs[3].style.display = "none";
            option_labels[2].style.display = "none";
            option_labels[3].style.display = "none";
            opt_count = 2;
      } else {
            option_inputs[2].style.display = "inline";
            option_inputs[3].style.display = "inline";
            option_labels[2].style.display = "inline";
            option_labels[3].style.display = "inline";
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
}

start_quizz.addEventListener('click',() => {
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
      call(url);
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
                 if(q_num < count){
                        show(responce);
                        setTimeout(() => {
                              msg.innerText = "";
                        },1000);
                 }else{
                  setTimeout(() => {
                        msg.innerText = "All questions are finished! Start again the Quizz.";
                        quizBlock.classList.add('hide');
                  },1000);
                 }
            }else{
                  msg.innerText = "Wrong answer !!!";
                  setTimeout(() => {
                        msg.innerText = "";
                  }, 1000);
            }
      }
});