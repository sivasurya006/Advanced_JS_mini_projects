const {log} = console;


const calculators = document.getElementById('calculators');
const explore = document.getElementById('explore');

calculators?.addEventListener('click', (e) => {
    const calculatorDiv = e.target.closest('#calculators > div');
    
    if (!calculatorDiv) return;

    const value = calculatorDiv.dataset.value;

    switch(value){
        case 'bmi-calculator' :
            window.location.href = '/calculate/bmi'
    }
    
});

explore?.addEventListener('click',(e) => {
    window.location.href = 'tools'
});
