interface IPerson {
    name: string;
    age: number;
    telephone: string;
}

class Person implements IPerson {
  constructor(public name:string, public age:number, public telephone:string) {
  }
}
