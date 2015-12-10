interface IPlants {
	Genus: string
	Species: string
	Region: string
	Name: string
}

class Plant implements IPlants {
	constructor(public Genus: string, public Species: string, public Region: string, public Name: string) {
	}
	
	info() {
		return `I have an ${this.Name} tree. It is of the genus ${this.Genus}
and of the species ${this.Species}. It is primarly grown in the ${this.Region}.`;
	}
}

var myPlant = new Plant("Malus", "Domestica", "Northern Hemisphere", "Orchard Apple");
alert(myPlant.info());

