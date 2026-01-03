const {log} = console;
import { isValidName ,isValidEmail ,isStrongPassword } from "./validation.js";

$('#encryptNow').on('click',() => {
    location.href = '/encrypt';
})

$('#decryptNow').on('click',() => {
    location.href = '/decrypt';
})

function triggerInput(){
    $('#user-file')[0].click();
}

$('.input-container').on('click', triggerInput)



$('#processBtn').on('click', async function () {
    const file = $('#user-file')[0].files[0];

    if (!file) {
        showError('Please select a file!');
        return;
    }

    const action = this.dataset.action;

    const maxSize = action == 'encrypt' ?  2 * 1024 * 1024 : 6.2 * 1024 * 1024;

    if (file.size > maxSize) {
        showError('File is too large (max 5MB)');
        return;
    }
    
    const allowedTypes = {
        encrypt: ['.txt'],
        decrypt: ['.enc']
    };

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if(!allowedTypes[action].includes(ext)) {
        showError(`Invalid file type. Allowed: ${allowedTypes[action].join(', ')}`);
        return;
    }

    $(this).prop('disabled', true);
   

    const formData = new FormData();
    formData.append('usr_file', file);

    if(action === 'decrypt') {
        const key = $('#key').val().trim();
        if (!key) {
            showError('Please enter the key');
            $(this).prop('disabled', false);
            return;
        }
        formData.append('key', key);
    }

    $('#file-name').text("");
    $('#key').val("");

    try {

        $('.input-container *').addClass('hidden');
        $('#loader').removeClass('hidden');
        $('.input-container').off('click');

        const response = await fetch(`/${action}`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const data = await response.json();
            log(data.msg);
            throw new Error('Something went wrong. Please try again');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        showError("Successfully "+action+"ed.",true);

        $('#downloadBtn').off('click').on('click', () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = action === 'encrypt' ? file.name + '.enc' : file.name + '.txt';
            a.click();
            showError("Successfully downloaded",true);
        });

        $('#loader').addClass('hidden');
        $('.upload-buttons').removeClass('hidden');
        $('.upload-buttons *').removeClass('hidden');
    } catch (err) {
        showError(err.msg);
        $(this).prop('disabled', false);
        $('.input-container *').removeClass('hidden');
        $('#loader').addClass('hidden');
        $('.upload-buttons *').addClass('hidden');
    }
});

$('#backBtn').on('click',(e) => {

    e.stopPropagation();
   
    $('.input-container *').removeClass('hidden');
    $('#loader').addClass('hidden');
    $('.upload-buttons *').addClass('hidden');
    $('.input-container').on('click', triggerInput)
});


$('#user-file').on('change', function () {
    if (this.files.length > 0) {
        $('#file-name').text(this.files[0].name);
    } else {
        $('#file-name').text('No file selected');
    }
});

//  ============== Popup ===============
const smileIcon = `<i class="fa-solid fa-face-smile"></i>`;
const errIcon = '<i class="fa-solid fa-circle-exclamation"></i>';

function showError(msg, notify){
    $('#popupIconContainer').html(notify ? smileIcon : errIcon);
    $('#errMsg').text(msg);

    if ($('#errPopup').hasClass('hidden')) {
        $('#errPopup').removeClass('hidden');
        $('#errMsgContainer').addClass(notify ? 'info' : 'err');

        setTimeout(() => {
            $('#errPopup').addClass('hidden');
            $('#errMsgContainer').removeClass('info err');
        }, 4000);
    }
}


// settings js

function updateFeature() {
    const selected = $('#file-permission').val();
    if (selected === 'allow') {
        $('#allow-feature').show();
        $('#deny-feature').hide();
    } else {
        $('#allow-feature').hide();
        $('#deny-feature').show();
    }
}


updateFeature();


$('#file-permission').change(function() {
    updateFeature();
    $("#updatePreference").prop("disabled",false);
});

$("#updatePreference").on('click',async () => {
    const perm  = $('#file-permission').val()
    let option = false;
    if(perm == "allow"){
        option =true;
    }
    const response = await fetch('/settings/fileStoragePermission',{
        method : 'post',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({allowed : option})
    });

    const data = await response.json();
    

    if(data.ok){
        showError(data.msg,true);
    }else{
        showError(data.msg);
    }
    
});


$('#updatePassword').on('click', async () => {
    const currentPassword = $("#currentPassword").val();
    const password =  $("#password").val();
    const confirmPassword =  $("#confirmPassword").val();

    if(!currentPassword || !password || !confirmPassword){
        showError("All fields are mandatory");
        return;
    }
    if(password != confirmPassword){
        showError("Password didn't match");
        return;
    }

    const validPassword = isStrongPassword(password);

    if(!validPassword.ok) return showError(validPassword.msg);

    const response = await fetch('/update_password',{
        method : 'post',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({currentPassword,password})    
    });

    const data = await response.json();
    if(!data.ok){
        showError(data.msg);
        return;
    }

    $("#currentPassword").val("");
    $("#password").val("");
    $("#confirmPassword").val("");

    showError("Password updated successfully!",false);
    // fetch('/logout',{method : 'post'});
    // location.href = '/signin';
})

$('#logout-btn').on('click',() => {
    const res = confirm("Do you want logout");
    log(res)
    if(res){
        fetch('/logout',{method : 'post'});
        location.href = '/signin';
    }
})