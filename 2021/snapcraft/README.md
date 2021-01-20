# Making Snaps

### A side quest

From: [Kubernetes and Skaffold Course Notes](../2020/docker-kubernetes-course/section-19.md)

As part of running through a kubernetes course, I started to setup a `skaffold` system. Unfotunately the `skaffold` snap image is out of date and I started to hit errors. This side quest is all about getting a new updated version of skaffold in a snap. But step 1, how do I build snaps.

## Creating a new snap.

https://ubuntu.com/tutorials/create-your-first-snap#2-getting-started

```
$ snap version
snap    2.48.2
snapd   2.48.2
series  16
ubuntu  20.04
kernel  5.4.0-60-generic
```

We're making a snap called -- `hello`

```
$ mkdir -p ~/mysnaps/hello
$ cd ~/mysnaps/hello
```

Next up -- `snapcraft`

```
ali@stinky:~/mysnaps/hello$ sudo snap install snapcraft
[sudo] password for ali:
error: This revision of snap "snapcraft" was published using classic
       confinement and thus may perform arbitrary system changes outside of the
       security sandbox that snaps are usually confined to, which may put your
       system at risk.

       If you understand and want to proceed repeat the command including
       --classic.
ali@stinky:~/mysnaps/hello$ sudo snap install snapcraft --classic
snapcraft 4.4.4 from Canonical✓ installed
```

Now I've updated the `snapcraft.yml` file;

```
name: hello
base: core18
version: '2.10'
summary: GNU Hello, the "hello world" snap
description: |
  GNU hello prints a friendly greeting.

grade: devel
confinement: devmode

parts:
  gnu-hello:
    source: http://ftp.gnu.org/gnu/hello/hello-2.10.tar.gz
    plugin: autotools
```

This is next; has a node base, probably runs `npm i && npm start`. Here `autotools` runs `./configure && make && make install`

Now to build.

```
ali@stinky:~/mysnaps/hello$ snapcraft
Support for 'multipass' needs to be set up. Would you like to do it now? [y/N]: y
snapd is not logged in, snap install commands will use sudo
[sudo] password for ali:
Download snap "multipass" (2907) from channel "latest/stable"

# ... build output from make etc ...

make[3]: Leaving directory '/root/parts/gnu-hello/build'
make[2]: Leaving directory '/root/parts/gnu-hello/build'
make[1]: Leaving directory '/root/parts/gnu-hello/build'
Staging gnu-hello
Priming gnu-hello
Snapping |
Snapped hello_2.10_amd64.snap
```

At this point the snap is built. Now to install;

```
$ sudo snap install --devmode hello_2.10_amd64.snap
hello 2.10 installed
```

```
$ snap list hello
Name   Version  Rev  Tracking  Publisher  Notes
hello  2.10     x1   -         -          devmode

$ hello

Command 'hello' not found, but can be installed with:

sudo snap install hello              # version 2.10, or
sudo apt  install hello              # version 2.10-2ubuntu2
sudo apt  install hello-traditional  # version 2.10-5

See 'snap info hello' for additional versions.

$ snap info hello
name:      hello
summary:   GNU Hello, the "hello world" snap
publisher: –
store-url: https://snapcraft.io/hello
license:   unset
description: |
  GNU hello prints a friendly greeting.
refresh-date: today at 07:13 PST
channels:
  latest/stable:    2.10    2019-04-17 (38) 98kB -
  latest/candidate: 2.10    2017-05-17 (20) 65kB -
  latest/beta:      2.10.1  2017-05-17 (29) 65kB -
  latest/edge:      2.10.42 2017-05-17 (34) 65kB -
installed:          2.10               (x1) 98kB devmode
```

So mine isn't working.

How do I run my devmode hello?

I have to define the command. This is added to `snapcraft.yaml`

```
apps:
  hello:
    command: bin/hello
```

Then rebuild; and shell into the "snap" to poke around.

```
$ snapcraft prime --shell

# New shell

$ ls stage/bin/
hello

$ ls prime/bin/
ls: cannot access 'prime/bin': No such file or directory

$ snapcraft prime
Pulling ....

# ... build info ...

make[1]: Leaving directory '/root/parts/gnu-hello/build'
Staging gnu-hello
Priming gnu-hello
```

```
$ sudo snap install --devmode hello_2.10_amd64.snap
error: cannot open: "hello_2.10_amd64.snap"
```

That command didn't work, but the file is in `prime/bin` now.

So I exited the VM and ran in the `snaps/hello` directory;

```
$ sudo snap install --devmode hello_2.10_amd64.snap
[sudo] password for ali:
hello 2.10 installed
```

```
ali@stinky:~/mysnaps/hello$ hello
Hello, world!
ali@stinky:~/mysnaps/hello$ which hello
/snap/bin/hello
```

Working!

Done.

## Stage 2 - update the skaffold snap to latest.

How hard can it be?
