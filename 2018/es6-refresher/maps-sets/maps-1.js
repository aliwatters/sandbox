let cardAce = {
	name: 'Ace of Spades'
};

let cardKing = {
	name: 'King of Clubs'
};

let deck = new Map();
deck.set('as', cardAce);
deck.set('kc', cardKing);

console.log(deck);
console.log(deck.size);


console.log(deck.get('as'));

deck.delete('as');

console.log(deck);

deck.set('as', cardAce);

for (let key of deck.keys()) {
	console.log(key);
}

for (let val of deck.values()) {
	console.log(val);
}

for (let entry of deck) {
	console.log(entry);
}


