let cardAce = {
	name: 'Ace of Spades'
};

let cardKing = {
	name: 'King of Clubs'
};

// needs reference types as keys and can be garbage collected
let deck = new WeakMap();
deck.set('as', cardAce);
deck.set('kc', cardKing);

console.log(deck);
console.log(deck.size);


