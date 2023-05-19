// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
const d3 = await import("d3");

var theMax = d3.max([1,2,20,3]);
console.log(theMax);

d3.csv("./Task for test/end.csv").then(function(data) {
    console.log(data);
});