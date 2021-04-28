console.log("index.js");

const myFunction = () => {
  console.log("this my arrow function");
};

const zima = {
  get: (param) => {
    console.log(`this is my get function: ${param}`);
  },
};

myFunction();

zima.get("test");
