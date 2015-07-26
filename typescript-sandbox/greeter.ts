class Student {
  fullname: string;
  constructor(public firstname: string, public middleinitial: string, public lastname: string) {
    this.fullname = firstname + " " + middleinitial + " " + lastname;
  }
}

interface Person {
  firstname: string;
  lastname: string;
}

function greeter(person: Person) {
  return "Hello, " + person.firstname + " " + person.lastname;
}

var user = new Student('Joe', 'M', 'Doe');

document.body.innerHTML = greeter(user);
