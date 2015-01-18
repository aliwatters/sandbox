package main

import (
	"fmt"
)

func Sqrt(x float64) float64 {
	z := float64(x / 10 + 1) // better than 1
	fmt.Println("Starting with ", z)
	count := 1
	for {
		old := z
		z = z - (z * z - x) / (2 * x)
		d := z - old
		if d > -0.0001 && d < 0.0001 {
			fmt.Println(count)
			return z	
		}
		count++
	}
}

func main() {
	fmt.Println(Sqrt(4))
}
