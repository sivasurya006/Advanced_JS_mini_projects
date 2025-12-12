const {log} = console;


const calculators = document.getElementById('calculators');


calculators.addEventListener('click', (e) => {

    const calculatorDiv = e.target.closest('#calculators > div');
    
    if (!calculatorDiv) return;

    const value = calculatorDiv.dataset.value;

    switch(value){
        case 'bmi-calculator' :
            window.location.href = '/calculate/bmi'
    }
    
});