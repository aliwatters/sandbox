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
	dogHappyHome.dropOffDog("Rex");
	dogHappyHome.dropOffDog("Rover");
	dogHappyHome.dropOffDog("Lassie");
	dogHappyHome.dropOffDog("Dexter");

	
	dogHappyHome.dropOffDog("PhoPho");

	dogHappyHome.pickUpDog();
	// here - do a while - get a dropOff pickUp of quit from stdin.

	dogHappyHome.printContents();

	return 0;
}

void DayCare::dropOffDog(string n) 
{
	cout << count << "\tof\t" << CAPACITY << "\n";
	if (count >= CAPACITY) {
		return;
	}
	cout << "Drop Off\t" << count << " " << n << "\n";

	pool[count] = Dog(n); // add dog to the pool in position count.
	count++;
	
	return;
}


void DayCare::pickUpDog() 
{
	if (count <= 0) {
		return;
	}
	count--;
	cout << "Pick Up\t" << pool[count].name << "\n";
	
	pool[count] = Dog(""); // add an empty dog

	return;
}

void DayCare::printContents() 
{
	cout << setw(15) << left << "\nDoggy Day Care\n==============\n";
	for( int i = 0; i < CAPACITY; i++ ) {
		cout << setw(15) << left << i << "\t" << pool[i].name << "\n";
	}
	cout << "\n";
	return;
}
	
