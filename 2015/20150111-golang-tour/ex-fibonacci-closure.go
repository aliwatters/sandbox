package main

import "fmt"

// fibonacci is a function that returns
// a function that returns an int.
func fibonacci() func() uint64 {
	
	previous := uint64(1)
	current := uint64(1)
	counter := 0
		
	return func () uint64 {
		// want defer counter++ to work but...
		
		//fmt.Println(counter, current, previous, current + previous)
		if counter <= 1 {
			counter++
			return 1
		}
		
		a := current
		current = current + previous
		previous = a
		counter++
		return current
	}
}

func main() {
	f := fibonacci()
	for i := 0; i < 35; i++ {
		fmt.Println(f())
	}
}

