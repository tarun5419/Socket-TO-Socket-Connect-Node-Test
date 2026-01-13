// const Redis = require('ioredis')
// const newRedis = new Redis();

// (async()=>{
//     const key = await newRedis.keys('*')
//     console.log(key,"keys");
//     for(let k of key){
//         const value = await newRedis.hget(k)  
//         console.log(value,"value");
//     }
// })()



const Redis = require('ioredis');
const newRedis = new Redis();

(async () => {
  try {
    const keys = await newRedis.keys('*'); // Get all keys
    console.log(keys, "keys");

    for (let k of keys) {
      const type = await newRedis.type(k); // Determine key type
      let value;

      if (type === 'hash') {
        value = await newRedis.hgetall(k); // Get all fields and values for hashes
      } else if (type === 'string') {
        value = await newRedis.get(k); // Get value for string keys
      } else {
        value = `Cannot display values for type: ${type}`; // Handle unsupported types
      }

      console.log(`Key: ${k}, Type: ${type}, Value:`, value);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    newRedis.disconnect(); // Always close the connection
  }
})();
