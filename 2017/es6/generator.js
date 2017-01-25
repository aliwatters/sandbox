
function* gen(n) {
  for (let i=0; i<n; i++){
    try {
      yield i;
    } catch (e) {
      console.log(e);
    }

  }
}

let it = gen(5);


console.log(it.next());
console.log(it.next());
console.log(it.throw('brrup')); // errors
console.log(it.return(5)); // replaces value... 
console.log(it.next());
