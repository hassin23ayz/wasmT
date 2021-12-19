document.getElementById('date').innerHTML = new Date().toDateString();

(async () => {
    // the wasm file contains compiled code, we need to load it 
    const response = await fetch('caesar.wasm');
    const file = await response.arrayBuffer();
    const wasm = await WebAssembly.instantiate(file);

    //extract wasm functions 
    //extract the memory shared between wasm and Js 
    const { memory, caesarEncrypt, caesarDecrypt } = wasm.instance.exports;

    //plaintext 
    const plaintext = "helloworld";
    const myKey = 3;

    //wasm can only work with numbers, we need to encode String characters
    //into numbers and decode string ch back into integers 
    //positional encoding is done
    const encode = function stringToIntegerArray(string, array) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < string.length; i++) {
            array[i] = alphabet.indexOf(string[i]);
        }
    };

    const decode = function integerArrayToString(array) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let string = "";
        for (let i = 0; i < array.length; i++) {
            string += alphabet[array[i]];
        }
        return string;
    };

    // We create a typed array which acts as a sort of window 
    // into the memory shared between JS and wasm.
    // 0 : means the array begins at the very beginning of the shared memory
    const myArray = new Int32Array(memory.buffer, 0, plaintext.length);

    //positional encoding checking
    encode(plaintext, myArray);
    console.log(myArray);
    //positional decoding checking
    console.log(decode(myArray));
    
    //call Encrypting of the wasm module 
    caesarEncrypt(myArray.byteOffset, myArray.length, myKey);
    //wasm encryption checking 
    console.log(myArray);
    //positional decoding gives string output 
    console.log(decode(myArray)); 

    //call Decryption of the wasm module 
    caesarDecrypt(myArray.byteOffset, myArray.length, myKey);
    //wasm decryption checking 
    console.log(myArray);
    console.log(decode(myArray));

})();