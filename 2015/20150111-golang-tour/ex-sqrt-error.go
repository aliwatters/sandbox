package main

import (
	"fmt"
)

type ErrNegativeSqrt float64
	
func (e ErrNegativeSqrt) Error() string {
	return fmt.Sprintf("cannot Sqrt negative number: %f", float64(e))
}


func Sqrt(x float64) (float64, error) {
	if (x < 0) {
		return 0, ErrNegativeSqrt(x)
	}
	z := float64(x / 10 + 1) // better than 1

	count := 1
	for {
		old := z
		z = z - (z * z - x) / (2 * x)
		d := z - old
		if d > -0.0001 && d < 0.0001 {
			fmt.Println(count)
			return z, nil	
		}
		count++
	}
}

func main() {
	fmt.Println(Sqrt(2))
	fmt.Println(Sqrt(-2))
}

