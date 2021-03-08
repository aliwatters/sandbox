class Vehicle {
  constructor(public color: string = 'red') {
    this.color = color;
  }

  public drive(): void {
    console.log('chugga chugga');
  }

  protected honk(): void {
    console.log('beep beep');
  }

  public summary(): string {
    return `I am a vehicle and I am ${this.color}`;
  }

  public toString(): string {
    return this.summary();
  }
}

class TheCar extends Vehicle {
  constructor(public wheels: number, public color: string) {
    super(color);
  }

  // project has Car already.
  public drive(): void {
    console.log('vrm vrroom');
  }

  public startDriving(): void {
    this.drive();
    this.honk(); // child can call protected
    this.brake();
  }

  private brake(): void {
    console.log('screeech');
  }
}

const myCar3 = new Vehicle('yellow');

myCar3.drive();
// myCar3.honk(); // protected

const myCar4 = new TheCar(4, 'blue');

myCar4.startDriving();

console.log(myCar3, `Summary: ${myCar3}`, 'from toString()');
console.log(myCar4, `Summary: ${myCar4}`, 'from toString()');
