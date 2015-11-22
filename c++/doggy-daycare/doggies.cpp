#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

const int CAPACITY = 5;

struct Dog
{
	string name; // for illustration name is assumed unique

	Dog( string n = "" )
	{
		name = n;
	}

};

class DayCare
{
	public:
		Dog pool[CAPACITY];
		int count;

	public:
		void dropOffDog(string name);	// someone drops a dog off at the daycare
		void pickUpDog();	// someone picks up a dog
		
		//constructors
		DayCare()
		{
			// init empty
			count = 0;
		}
	
	public:
		void printContents(); // shows everything in daycare
};


int main ()
{
	// our daycare is called dogHappyHome
	DayCare dogHappyHome;

	dogHappyHome.printContents(); // print the contents of our doggy care

	dogHappyHome.dropOffDog("Fido");
	dogHappyHome.dropOffDog("Fifi");

	dogHappyHome.printContents();


	dogHappyHome.pickUpDog();
	// here - do a while - get a dropOff pickUp of quit from stdin.

	return 0;
}

void DayCare::dropOffDog(string n) 
{
	Dog * dog;
	dog = new Dog(n);

	cout << "Drop Off\t" << dog->name << "\n";

	pool[count] = *dog; // add do to the pool in position count.
	count++;
	
	return;
}


void DayCare::pickUpDog() 
{
	Dog * dog;
	count--;
	cout << "Pick Up\t" << pool[count].name << "\n";
	
	// pool[count] = null; // add an empty dog?

	return;
}

void DayCare::printContents() 
{
	cout << setw(15) << left << "\nDoggy Day Care\n==============\n";
	for( int i = 0; i < CAPACITY; i++ ) {
		if (i < count) {
			cout << setw(15) << left << i << "\t" << pool[i].name << "\n";
		} else {
			cout << setw(15) << left << i << "\t[Empty Slot]" << "\n";
		}
	}
	cout << "\n";
	return;
}
	
