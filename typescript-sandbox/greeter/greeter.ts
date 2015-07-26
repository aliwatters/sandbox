class Student {
  fullname: string;
  title: string;
  constructor(public firstname: string, public middleinitial: string, public lastname: string) {
    this.fullname = firstname + " " + middleinitial + " " + lastname;
  }
}

interface Person {
  firstname: string;
  lastname: string;
  title?: string;
}

function greeter(person: Person): string {
  var title = person.title || '';
  if (title.length > 0) {
    title += ' ';
  }
  return "Hello, "  + title + person.firstname + " " + person.lastname;
}

function alerter(person: Person): void {
  alert(greeter(person));
}

var user = new Student('Joe', 'M', 'Doe');
// user.title = 'Master';

document.body.innerHTML = greeter(user);
