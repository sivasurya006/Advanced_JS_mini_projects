const template = document.createElement('template');

template.innerHTML = `
    <style>
        .container *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }    

       .container{
         background-color : #0E1119;
         width : 200px;
         box-shadow : 0px 4px 10px rgba(255,255,255,0.15);
         border-radius : 16px;
         display : flex; 
         flex-direction : column;
         align-items : center;
         padding : 1rem;
         text-align : center;
       }
       .icon-container{
         width : 100%;
         background-color : ;
         position : relative;
       }
       .date{
            color : rgba(255,255,255,0.7);
            font-size : 0.8rem;
       }
       .options{
            position : absolute;
            top : 0%;
            left : 85%;
            z-index : 5;
            height : 25px;
            width : 25px;
            border-radius : 8px;
            padding : 2px;
       }
       .options:hover{
            cursor : pointer;
            background-color : rgba(255,255,255,0.08);
       }
       .option-list{
            position : absolute;
            top : 30%;
            left : 95%;
            background-color :  rgba(255,255,255,0.9);
            color : black;
            padding : 4px;
            font-size : 0.9rem;
            border-radius : 8px;
       }
       .option-list:hover{
        cursor:pointer;
        background-color:white;
       }
       .option-list > div{
            display:flex;
            gap : 10px;
            padding : 2px 4px;
       }
       .hidden {
            display:none;
       }
       .info{
        display:flex;
        flex-direction:column;
         gap:10px;
       }
    </style>
    <div class="container" id="kbsid">
        <div class="icon-container">
            <div class="options"> 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="#ffffff" d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z"/></svg>
            </div>
            <div class="option-list hidden">
                <div class="download" > <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height = 20px  width = 20px><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M176 544C96.5 544 32 479.5 32 400C32 336.6 73 282.8 129.9 263.5C128.6 255.8 128 248 128 240C128 160.5 192.5 96 272 96C327.4 96 375.5 127.3 399.6 173.1C413.8 164.8 430.4 160 448 160C501 160 544 203 544 256C544 271.7 540.2 286.6 533.5 299.7C577.5 320 608 364.4 608 416C608 486.7 550.7 544 480 544L176 544zM409 377C418.4 367.6 418.4 352.4 409 343.1C399.6 333.8 384.4 333.7 375.1 343.1L344.1 374.1L344.1 272C344.1 258.7 333.4 248 320.1 248C306.8 248 296.1 258.7 296.1 272L296.1 374.1L265.1 343.1C255.7 333.7 240.5 333.7 231.2 343.1C221.9 352.5 221.8 367.7 231.2 377L303.2 449C312.6 458.4 327.8 458.4 337.1 449L409.1 377z"/></svg> <span>Download </span></div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"   height = 80px width = 80px viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="#f97316" d="M192 112L304 112L304 200C304 239.8 336.2 272 376 272L464 272L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 128C176 119.2 183.2 112 192 112zM352 131.9L444.1 224L376 224C362.7 224 352 213.3 352 200L352 131.9zM192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 250.5C512 233.5 505.3 217.2 493.3 205.2L370.7 82.7C358.7 70.7 342.5 64 325.5 64L192 64zM248 320C234.7 320 224 330.7 224 344C224 357.3 234.7 368 248 368L392 368C405.3 368 416 357.3 416 344C416 330.7 405.3 320 392 320L248 320zM248 416C234.7 416 224 426.7 224 440C224 453.3 234.7 464 248 464L392 464C405.3 464 416 453.3 416 440C416 426.7 405.3 416 392 416L248 416z"/></svg>
        </div>  
    
        <div class="info">
            <p class="name"></p>
            <time class="date"></time>
        </div>
    </div>
`;


class FileDownload extends HTMLElement{

    smileIcon = `<i class="fa-solid fa-face-smile"></i>`;
    errIcon = '<i class="fa-solid fa-circle-exclamation"></i>';

    constructor(){
        super();
        this.attachShadow({mode : 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('.name').innerText = this.dataset.name;
        this.shadowRoot.querySelector('.date').innerText = this.dataset.created;
        this.shadowRoot.querySelector(".container").id = this.dataset.id;

        this.shadowRoot.addEventListener('mouseover', (e) => {
            const optionsBtn = e.target.closest('.options');
            if (!optionsBtn) return;
            const container = optionsBtn.closest('.icon-container');
            const optionList = container.querySelector('.option-list');
          
            optionList.classList.remove('hidden');
          });
          
          this.shadowRoot.addEventListener('mouseout', (e) => {
            const container = e.target.closest('.icon-container');
            if (!container) return;
            if (!container.contains(e.relatedTarget)) {
                container.querySelector('.option-list').classList.add('hidden');
            }

          });

          this.shadowRoot.querySelectorAll('.download').forEach( (e) => {
                e.addEventListener('click', async(e) => {
                    const id =  e.target.closest('.container').id;
                    console.log(id);
                    const response = await fetch( `/download/check?id=${id}`);
                    const data = await response.json();
                    if(!data.ok){
                        console.log(data);
                        this.showError(data.msg);
                        return;
                    }else{
                        this.showError("File downloaded successfully",true)
                    } 
                    const download = document.createElement('a');
                    download.href=`/download/file?id=${id}`;
                    download.click();
                })
          })
          
    }

    

    showError(msg, notify){
        $('#popupIconContainer').html(notify ? this.smileIcon : this.errIcon);
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
}

customElements.define('file-download',FileDownload);