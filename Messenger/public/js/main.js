const { log } = console;

 


$('#loginBtn').on('click', async () => {
    
    const userNameInp = $('#userName')[0];
    const nickNameInp = $('#nickName')[0];

    userNameInp.classList.remove('invalid');
    nickNameInp.classList.remove('invalid');

    const username = userNameInp.value.trim();
    const nickname = nickNameInp.value.trim();

    if(!username){
        userNameInp.classList.add('invalid');
        setTimeout(() => {
            userNameInp.classList.remove('invalid');
        },5000)
        return;
    }

    if(!nickname){
        nickNameInp.classList.add('invalid');
        setTimeout(() => {
            nickNameInp.classList.remove('invalid');
        },5000)
        return;
    }

    try{
        const response =  await fetch('/login',{
            method : 'post',
            headers :{
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({username,nickname})
        });
    
        const result = await response.json();
    
        if(!result.ok){
            log( "Error ocurred :",result.msg);
            return;
        }

        userNameInp.value = '';
        nickNameInp.value = '';

        window.location.href = '/';

    }catch(err){
        log(err);
    }
})

