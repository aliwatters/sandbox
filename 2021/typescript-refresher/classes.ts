class Vehicle {
  public drive(): void {
    console.log('chugga chugga');
  }

  protected honk(): void {
    console.log('beep beep');
  }

  public summary(): void {
    console.log('I ');
  }
}

class TheCar extends Vehicle {
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

const myCar3 = new Vehicle();

myCar3.drive();
// myCar3.honk(); // protected

const myCar4 = new TheCar();

myCar4.startDriving();
