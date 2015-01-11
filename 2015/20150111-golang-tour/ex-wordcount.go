package main

import (
	"code.google.com/p/go-tour/wc"
	"strings"
	// "fmt"
)

func WordCount(s string) map[string]int {
	// fmt.Println("Phrase", strings.Fields(s))
	
	a := strings.Fields(s)
	m := make(map[string]int)
	
	for i := 0; i < len(a); i++ {	
		m[a[i]] = m[a[i]] + 1
	}
	
	return m
}

func main() {
	wc.Test(WordCount)
}
