function sum<T>(a:T,b:T):number|undefined{
// return (a as number)+(b as number );
if(typeof a=="number"&&typeof b=="number"){
    return a+b;
}
}
console.log(sum(2,3))
function mapArray<T,U>(item:T[],callback:(item:T)=>U){
    return item.map(callback);
}
const product={
    id:1,
    title:"mobile",
    price:5000,
}
// console.log(mapArray([product],(item)=>item.price));
function countLength<T extends{length:number}>(value:T):number|undefined{
    return value.length;
 
}
   console.log(countLength("khushi"));