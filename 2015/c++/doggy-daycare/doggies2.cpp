#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

const int CAPACITY = 5;

class Dog // this version is class within a class
{
	private: 
		string _name; // for illustration name is assumed unique
		int _weight;

	public:
		string name();
		int weight();

		// constructor
		Dog( string n = "", int w = 50 )
		{
			_name = n;
			_weight = w;
		}

};

class DayCare
{
	public:
		Dog pool[CAPACITY];

		int count;

	public:
		void dropOffDog(string name, int weight );	// someone drops a dog off at the daycare
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

	dogHappyHome.dropOffDog("Fido", 80);
	dogHappyHome.dropOffDog("Fifi", 10);

	dogHappyHome.printContents();


	dogHappyHome.pickUpDog();
	dogHappyHome.dropOffDog("Rex", 100);
	dogHappyHome.dropOffDog("Rover", 150);
	dogHappyHome.dropOffDog("Lassie", 75);
	dogHappyHome.dropOffDog("Dexter", 40);

	
	dogHappyHome.dropOffDog("PhoPho", 5);

	dogHappyHome.pickUpDog();
	// here - do a while - get a dropOff pickUp of quit from stdin.

	dogHappyHome.printContents();

	return 0;
}

void DayCare::dropOffDog(string n, int w) 
{
	cout << count << "\tof\t" << CAPACITY << "\n";
	if (count >= CAPACITY) {
		return;
	}
	cout << "Drop Off\t" << count << " " << n << w << "\n";

	pool[count] = Dog(n, w); // add dog to the pool in position count.
	count++;
	
	return;
}


void DayCare::pickUpDog() 
{
	if (count <= 0) {
		return;
	}
	count--;
	cout << "Pick Up\t" << pool[count].name() << "\n";
	
	pool[count] = Dog(""); // add an empty dog

	return;
}

void DayCare::printContents() 
{
	cout << setw(15) << left << "\nDoggy Day Care\n==============\n";
	for( int i = 0; i < CAPACITY; i++ ) {
		cout << setw(15) << left << i << "\t" << pool[i].name() << "\t" << pool[i].weight() << "lbs" << "\n";
	}
	cout << "\n";
	return;
}
	

int Dog::weight() {
	return _weight;
}

string Dog::name() {
	return _name;
}
