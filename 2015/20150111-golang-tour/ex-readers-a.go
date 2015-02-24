package main

import (
	"code.google.com/p/go-tour/reader"
)

type MyReader struct{}


func (reader MyReader) Read(b []byte) (int, error) {
  b[0] = 'A'
  return 1, nil
}


func main() {
	reader.Validate(MyReader{})
}

