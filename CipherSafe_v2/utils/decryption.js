// sBox 
const sBox = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

// inverse sBox
const invSbox = new Array(256);                          
for(let i=0;i<256;i++){
    invSbox[sBox[i]] = i;
}

// console.log(sBox[0]);
// console.log(invSbox[99]);

const rCon = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1B,0x36];           // round Constants useful for key expansion  (for AES-128 rounds 1..10)


 // helper function to find 2.a
function xtime(a){
    a = a & 0xff;                                                           //it remove the bits over 8.  byte masking   1111 1111. ensure only 8 bits.  anything above 8 bits is cut off.
    return (a & 0x80) ? (((a << 1) & 0xff) ^ 0x1B) : ((a << 1) & 0xff);     // ( a & 0x80 ) it check the fist bit is 1 or 0. detailed explanation in my note. 
}

// MixColumns helpers


function mulBy9(a){ 
    return xtime(xtime(xtime(a))) ^ a;
 }
function mulBy11(a){
    return xtime(xtime(xtime(a))) ^ xtime(a) ^ a;
}
function mulBy13(a){
    return xtime(xtime(xtime(a))) ^ xtime(xtime(a)) ^ a;
}
function mulBy14(a){
    return xtime(xtime(xtime(a))) ^ xtime(xtime(a)) ^ xtime(a);
}

function invMixOneColumn(column){
  let a0 = column[0];
  let a1 = column[1];
  let a2 = column[2];
  let a3 = column[3];

  let newc0Val = mulBy14(a0) ^ mulBy11(a1) ^ mulBy13(a2) ^ mulBy9(a3);
  let newc1Val = mulBy9(a0)  ^ mulBy14(a1) ^ mulBy11(a2) ^ mulBy13(a3);
  let newc2Val = mulBy13(a0) ^ mulBy9(a1)  ^ mulBy14(a2) ^ mulBy11(a3);
  let newc3Val = mulBy11(a0) ^ mulBy13(a1) ^ mulBy9(a2)  ^ mulBy14(a3);

  column[0] = newc0Val & 0xff;
  column[1] = newc1Val & 0xff;
  column[2] = newc2Val & 0xff;
  column[3] = newc3Val & 0xff;
}



function addRoundKey(currentState, key){                                     // need to clarify
    for(let row=0; row<4; row++){
      for(let col=0; col<4; col++){
        const keyIndex = 4*col + row;
        currentState[row][col] = (currentState[row][col] ^ key[keyIndex]) & 0xff;
      }
    }
}


// InvSubBytes
function invSubBytes(state){
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            state[i][j] = invSbox[state[i][j]];
        }
    }
}

// InvShiftRows
function invShiftRows(state){
    for(let i=0;i<4;i++) invShift(state[i], i);
}
function invShift(arr,count){
    for(let k=0;k<count;k++){
      let temp = arr[arr.length-1];
      for(let j=arr.length-2;j>=0;j--){
        arr[j+1] = arr[j];
      }
      arr[0] = temp;
    }
}


// invMixColumns 
function invMixColumns(state){
    for(let col=0; col<4; col++){
      let column = [];
      for(let row=0; row<4; row++){
        column[row] = state[row][col];
      }
      invMixOneColumn(column);
      for(let row=0; row<4; row++){
        state[row][col] = column[row];
      }
    }
}

// Key schedule helpers
function rotateWord(word){
    return [word[1], word[2], word[3], word[0]];
}
function sub_word(word){
    for(let i=0;i<4;i++){
        word[i] = sBox[word[i]];
    } 
    return word; 
}
function xorWords(a,b){
    return [a[0]^b[0], a[1]^b[1], a[2]^b[2], a[3]^b[3]];
}


// KeyScheduler (uses Rcon table)
function keyScheduler(roundKey){
    // roundKey: array of 16 bytes
    let words = new Array(44);

    // fill first 4 words
    for(let i=0;i<4;i++){
      words[i] = [];
      for(let j=0;j<4;j++){
        words[i][j] = roundKey[i*4 + j] & 0xff;
      }
    }

    for(let i=4;i<44;i++){
      let temp = Array.from(words[i-1]);
      if(i % 4 === 0){
        temp = sub_word(rotateWord(temp));
        temp[0] ^= rCon[(i/4)-1]; // XOR rcon into first byte
      }
      words[i] = xorWords(words[i-4], temp);
    }
  
    return words.flat(); // 176 bytes (44 words * 4)
  }
  
  // AES decrypt single 16-byte block
function AES_decrypt_block(state, expandedKey){
    // initial(with last round key)
    addRoundKey(state, expandedKey.slice(10*16, 11*16));
    for(let round=9; round>=1; round--){
      invShiftRows(state);
      invSubBytes(state);
      addRoundKey(state, expandedKey.slice(round*16, (round+1)*16));
      invMixColumns(state);
    }
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, expandedKey.slice(0,16));
}




export function AES_decrypt(message,roundKey){
    message=message.split(',');
    let messageStates = [];
    for(let k=0;k<Math.ceil(message.length/16);k++){
        let idx = k * 16;
        let state = [[],[],[],[]];
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){   
                state[i][j] = parseInt(message[idx],16);
                idx++;      
            }
        }
        messageStates.push(state);
    }
    let expanded=keyScheduler(roundKey);
    let plainTextAll = "";
    for (let i = 0; i < messageStates.length; i++) {

        // decrypt
        AES_decrypt_block(messageStates[i],expanded);
        let plainState=messageStates[i].flat();

        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++){
                let code = plainState[r*4 + c];
                plainTextAll += code ? String.fromCharCode(code) : '';
            }
        }
    }
    return plainTextAll;
}







