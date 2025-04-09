import { promise } from "bcrypt/promises";
import { resolveObjectURL } from "buffer";

const temp = new Promise(
    
    function exec(resolve,reject){setTimeout(()=>{console.log("waitover"); resolve("gotit");} ,500)
    }
);
temp.then((e)=>console.log("success"))
console.log("comon")
