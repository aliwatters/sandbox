# Go Course - Go Lang Coding.

Notes and examples from Udemy

https://www.udemy.com/learn-how-to-code

Section 1: Setup.

Installation - already had 1.4 - moved to 1.5.2 (64bit linux)
```
wget https://storage.googleapis.com/golang/go1.5.2.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.5.2.linux-amd64.tar.gz 
```

Note: go recommends a workspace folder - mine is in /home/ali/go - I'll symlink from there to subfolders here for this course.


Note: hit errors with upgrade of Go

```
package runtime: C source files not allowed when not using cgo or SWIG: atomic_amd64x.c defs.c float.c heapdump.c lfstack.c malloc.c mcache.c mcentral.c mem_linux.c mfixalloc.c mgc0.c mheap.c msize.c os_linux.c panic.c parfor.c proc.c runtime.c signal.c signal_amd64x.c signal_unix.c stack.c string.c sys_x86.c vdso_linux_amd64.c
```

Seems there is old c code left over from previous installation:

```
sudo rm -rf /usr/local/go/
wget https://storage.googleapis.com/golang/go1.5.2.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.5.2.linux-amd64.tar.gz
```

Resolved Problem - HELLO WORLD! :)


Additionally - if installing first time - have to set up some go env vars. GOPATH (workspace) GOROOT (/usr/local/bin/go - or whereever) etc - easy done before.

For the course then run: ```go get github.com/GoesToEleven/GolangTraining``` - adds to ~/go/src/...



