let person = {
  name: 'Ali',
  hobbies: [ 'Climbing', 'Flying' ],
  [Symbol.iterator]: function() {
    let i = 0;
    let hobbies = this.hobbies;
    return {
      next: function() {
        let val = hobbies[i];
        i++;
        return { done: i > hobbies.length, value: val };
      }
    };
  }
};

for (let hobby of person) {
  console.log(hobby);
}

