const formBtn = document.getElementById('calculate');
const result = document.getElementById('result');
const heightIp = document.getElementById('heightIp');
const weightIP = document.getElementById('weightIp');
const bmiScore = document.getElementById('bmi-score');
const summaryContent = document.getElementById('summary');
const recommendationContent = document.getElementById('recommendation');
const resultSection = document.getElementById('result-section');

formBtn.addEventListener('click',async (e) => {
    e.preventDefault();

    const height = parseFloat(heightIp.value);
    const weight = parseFloat(weightIP.value);

    formBtn.innerHTML = '<i class="fa-solid fa-spinner"></i>';

    try{
        if( !(height > 0) || !(weight > 0)){
            formBtn.innerHTML = 'Calculate BMI';
            throw new Error('Enter valid details');
        }

        const req = await fetch('/calculate/bmi',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ height,weight })
        });

        const res = await req.json();
        console.log(res)
        if(req.ok){
            const {bmi, summary, recommendation} = res.result;
            bmiScore.innerText = bmi.toFixed(2);
            summaryContent.innerText = summary;
            recommendationContent.innerText = recommendation;
            resultSection.classList.remove('hide');

            formBtn.innerHTML = 'Calculate BMI';
        }else{
            result.innerText = 'Server Error';
            formBtn.innerHTML = 'Calculate BMI';
        }

    }catch(err){
        result.innerText = err.message || 'Request Failed.';
        formBtn.innerHTML = 'Calculate BMI';
    }
     
});