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

Done. No.

Next up https://ubuntu.com/tutorials/create-your-first-snap#5-a-snap-is-made-of-parts

This is interesting;

> This time the command name is different from the snap name. By default, all commands are exposed to the user as <snap-name>.<command-name>. This binary will thus be hello.bash. That way, we will avoid a clash with /bin/bash (system binaries trump binaries shipped by snaps) or any other snaps shipping a bash command. However, as you may remember, the first binary is named hello. This is due to the simplification when equals . Instead of hello.hello, we have the command condensed to hello.

Which explains the `microk8s.<commands>` seen there.

```
ali@stinky:~/mysnaps/hello$ snapcraft
# ... build output ...

ali@stinky:~/mysnaps/hello$ sudo snap install --devmode hello_2.10_amd64.snap
hello 2.10 installed

ali@stinky:~/mysnaps/hello$ hello
Hello, world!

ali@stinky:~/mysnaps/hello$ hello.bash

bash-4.3$ env
SSH_AGENT_PID=20505
GPG_AGENT_INFO=/run/user/1000/gnupg/S.gpg-agent:0:1
# ...
```

Note: `env` in that shell had access to all my environment vars which included some _sensitive keys!_

These however are the interesting vars;

```
SNAP_ARCH=amd64
SNAP_COMMON=/var/snap/hello/common
SNAP_CONTEXT=hKE72Fn1hNqTv5thzjj-qe3YvoAajt100w7ALa0e_cb_gM-G4O37
SNAP_COOKIE=hKE72Fn1hNqTv5thzjj-qe3YvoAajt100w7ALa0e_cb_gM-G4O37
SNAP_DATA=/var/snap/hello/x3
SNAP_INSTANCE_KEY=
SNAP_INSTANCE_NAME=hello
SNAP_LIBRARY_PATH=/var/lib/snapd/lib/gl:/var/lib/snapd/lib/gl32:/var/lib/snapd/void
SNAP_NAME=hello
SNAP_REAL_HOME=/home/ali
SNAP_REEXEC=
SNAP_REVISION=x3
SNAP=/snap/hello/x3
SNAP_USER_COMMON=/home/ali/snap/hello/common
SNAP_USER_DATA=/home/ali/snap/hello/x3
SNAP_VERSION=2.10
```

Now; removing the dev tags and modes from our config, 'cause it's all tested and working and other folks want to use it.

`confinement: strict` -- change from `devmode` in the `snapcraft.yml`

Build and install.

```
$ sudo snap install hello_2.10_amd64.snap
error: cannot find signatures with metadata for snap "hello_2.10_amd64.snap"
```

Not in the appstore so has no signatures -- seems fair enough!

`--dangerous` gets around that.

Next up, publishing my snap. Already have an `aliwatters` ubuntu account, signed in.

```
ali@stinky:~/mysnaps/hello$ snapcraft login
Enter your Ubuntu One e-mail address and password.
If you do not have an Ubuntu One account, you can create one at https://snapcraft.io/account
Email: ali.watters@example.com
Password:

We strongly recommend enabling multi-factor authentication: https://help.ubuntu.com/community/SSO/FAQs/2FA
Do you agree to the developer terms and conditions. (https://dashboard.snapcraft.io/dev/agreements/new/)?: y

Login successful.
```

Registering a snap.

```
ali@stinky:~/mysnaps/hello$ snapcraft register aliwatters-hello

We always want to ensure that users get the software they expect
for a particular name.

If needed, we will rename snaps to ensure that a particular name
reflects the software most widely expected by our community.

For example, most people would expect 'thunderbird' to be published by
Mozilla. They would also expect to be able to get other snaps of
Thunderbird as '$username-thunderbird'.

Would you say that MOST users will expect 'aliwatters-hello' to come from
you, and be the software you intend to publish there? [y/N]: y
Registering aliwatters-hello.
Congrats! You are now the publisher of 'aliwatters-hello'.
```

Seems like squatters could cause hassle here! Hope canonical tidy up. Interestingly the tutorial suggests `<snapname>-<username>` where as `snapcraft` looks to prefer `<username>-<snapname>` (I went with that as a hunch).

Update `snapcraft.yml`

```
name: aliwatters-hello
grade: stable
```

Build and publish... should be;

```
$ snapcraft
# lots and lots of build info

$ sudo snap remove hello
# remove dev version

$ snapcraft push aliwatters-hello_2.10_amd64.snap --release=candidate
```

But -- it crashed at this point:

```
$ snapcraft

# ... build output
exec failed: ssh connection failed: 'Connection refused'
Run the same command again with --debug to shell into the environment if you wish to introspect this failure.
An error occurred when trying to execute 'sudo -H -i env SNAPCRAFT_BUILD_ENVIRONMENT=managed-host HOME=/root SNAPCRAFT_HAS_TTY=True snapcraft snap' with 'multipass': returned exit code 255.

ali@stinky:~/mysnaps/hello$ snapcraft
Launching a VM.
snap "snapd" has no updates available
[Errno 5] Input/output error: '/root/project'
We would appreciate it if you anonymously reported this issue.
No other data than the traceback and the version of snapcraft in use will be sent.
Would you like to send this error data? (Yes/No/Always/View) [no]: yes
Thank you, sent.
Run the same command again with --debug to shell into the environment if you wish to introspect this failure.

ali@stinky:~/mysnaps/hello$ snapcraft --debug
Launching a VM.
snap "snapd" has no updates available
Could not find snap/snapcraft.yaml. Are you sure you are in the right directory?
To start a new project, use `snapcraft init`
snapcraft-hello #
```

Not sure what to do to debug here.

Well -- I tried a few times and seemed to create a package at some point.

```
ali@stinky:~/mysnaps/hello$ ls -ltra
total 5968
drwxrwxr-x 3 ali ali    4096 Jan 20 06:39 ..
drwxrwxr-x 2 ali ali    4096 Jan 20 06:42 snap
-rw-r--r-- 1 ali ali 3047424 Jan 21 07:54 hello_2.10_amd64.snap
drwxrwxr-x 3 ali ali    4096 Jan 21 08:06 .
-rw-r--r-- 1 ali ali 3047424 Jan 21 08:07 aliwatters-hello_2.10_amd64.snap
```

Let's publish.

```
ali@stinky:~/mysnaps/hello$ snapcraft push aliwatters-hello_2.10_amd64.snap --release=candidate
DEPRECATED: The 'push' set of commands have been replaced with 'upload'.
See http://snapcraft.io/docs/deprecation-notices/dn11 for more information.
Preparing to upload 'aliwatters-hello_2.10_amd64.snap'.
After uploading, the resulting snap revision will be released to 'candidate' when it passes the Snap Store review.
Install the review-tools from the Snap Store for enhanced checks before uploading this snap.
Pushing 'aliwatters-hello_2.10_amd64.snap' [======================================================] 100%
Processing...|
released
Revision 1 of 'aliwatters-hello' created.
Track    Arch    Channel    Version    Revision
latest   amd64   stable     -          -
                 candidate  2.10       1
                 beta       ↑          ↑
                 edge       ↑          ↑
```

Done.

```
ali@stinky:~/mysnaps/hello$ sudo snap install --candidate aliwatters-hello
aliwatters-hello (candidate) 2.10 from Ali Watters (aliwatters) installed

ali@stinky:~/mysnaps/hello$ hello
bash: /snap/bin/hello: No such file or directory
```

Found it -- due to the `hello.hello` being condenced to `hello` -- `aliwatters-hello.hello` is the command.

```
ali@stinky:~/mysnaps/hello$ aliwatters-hello.hello
Hello, world!
```

Trying to name `hello` see if that fixes it.

So -- that gives;

```
ali@stinky:~/mysnaps/hello$ snapcraft
Launching a VM.
snap "snapd" has no updates available
Could not find snap/snapcraft.yaml. Are you sure you are in the right directory?
To start a new project, use `snapcraft init`
Run the same command again with --debug to shell into the environment if you wish to introspect this failure.
ali@stinky:~/mysnaps/hello$ ls snap/snapcraft.yaml -l
-rw-rw-r-- 1 ali ali 432 Jan 21 08:22 snap/snapcraft.yaml

ali@stinky:~/mysnaps/hello$ cat snap/snapcraft.yaml
name: hello
base: core18
version: '2.10'
summary: GNU Hello, the "hello world" snap
description: |
  GNU hello prints a friendly greeting.

grade: stable
confinement: strict

apps:
  hello:
    command: bin/hello
  bash:
    command: bash

parts:
  gnu-hello:
    source: http://ftp.gnu.org/gnu/hello/hello-2.10.tar.gz
    plugin: autotools
  gnu-bash:
    source: http://ftp.gnu.org/gnu/bash/bash-4.3.tar.gz
    plugin: autotools
```

[final `snapcraft.yaml`](./final-snapcraft.yaml)

## Stage 2 - update the skaffold snap to latest.

How hard can it be?

First make a new directory; `aliwatters-skaffold` - preparing for namespacing.

Then take a niave approach; try to recreate the steps in https://skaffold.dev/docs/install/ within the `snapcraft.yaml`

`snapcraft.yaml`

```
name: aliwatters-skaffold
base: core18
version: '0.1'
summary: Unofficial snap for skaffold
description: |
  The offical snap is out of date, so I am making a version that isn't

grade: devel # must be 'stable' to release into candidate/stable channels
confinement: devmode # use 'strict' once you have the right plugs and slots

apps:
  hello:
    command: bin/skaffold

parts:
  gnu-hello:
    source: https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
    plugin: autotools
```

```
ali@stinky:~/mysnaps/aliwatters-skaffold$ snapcraft
Failed to pull source: unable to determine source type of 'https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64'.
Check that the URL is correct or consider specifying `source-type` for this part. See `snapcraft help sources` for more information.
```

Errored, this is a ~50mb binary by the looks of it, so digging in with the help command.

```
$ snapcraft help sources

# ...

  - source-type: git, bzr, hg, svn, tar, deb, rpm, or zip

    In some cases the source string is not enough to identify the version
    control system or compression algorithm. The source-type key can tell
    snapcraft exactly how to treat that content.

$ file skaffold-linux-amd64
skaffold-linux-amd64: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, Go BuildID=28UrLFHg_FRaiYbjOPqz/XEefkc8LfTmXC72UGi1C/XHLskeu9zCBScSp7lY_s/GTRv1JxJTjysewpAfqip, stripped
```

Should just be able to move the file into the right place in the snap and have it work. I'll try a niave version of this too.

```
   <part-name>:
      plugin: copy
      source: <your source directory>
      files:
         <source path 1>: <destination path 1>
         <source path 2>: <destination path 2>
```

or somthing like this

```
parts:
  test-geekbench4:
    plugin: dump
    source: http://cdn.geekbench.com/Geekbench-$SNAPCRAFT_PROJECT_VERSION-Linux.tar.gz
```

ok -- trying `dump`.

Ended up getting blocked in many ways, so posted here in the snapcraft forum; https://forum.snapcraft.io/t/questions-from-creating-snap-devmode-for-skaffold-but-some-general-ones-included/22322

Where I had to break the links because of dumb new user limitations. A frustrating experience so far; I think I'll send an email to the ubuntu podcast -- ready for season 14.

**1/25**

A few days later, I'm running low on disk, with a 256gb msata2 this is common. So where was it all used?

```
ali@stinky:~/git/skaffold/examples/getting-started (master)$ sudo du -sh /var/snap/*
16K	/var/snap/code
16K	/var/snap/core
16K	/var/snap/core18
16K	/var/snap/gnome-3-28-1804
16K	/var/snap/gnome-3-34-1804
16K	/var/snap/gnome-system-monitor
16K	/var/snap/gtk-common-themes
16K	/var/snap/insomnia-designer
12K	/var/snap/kompose
12K	/var/snap/kubectl
6.2G	/var/snap/microk8s
30G	/var/snap/multipass # <-- THIS 30gb!
16K	/var/snap/node
12K	/var/snap/snapcraft
928K	/var/snap/snap-store

ali@stinky:~/git/skaffold/examples/getting-started (master)$ sudo snap remove multipass --purge
multipass removed

ali@stinky:~/git/skaffold/examples/getting-started (master)$ du -sh /var/snap/*
16K	/var/snap/code
16K	/var/snap/core
16K	/var/snap/core18
16K	/var/snap/gnome-3-28-1804
16K	/var/snap/gnome-3-34-1804
16K	/var/snap/gnome-system-monitor
16K	/var/snap/gtk-common-themes
16K	/var/snap/insomnia-designer
12K	/var/snap/kompose
12K	/var/snap/kubectl
669M	/var/snap/microk8s
16K	/var/snap/node
12K	/var/snap/snapcraft
928K	/var/snap/snap-store

ali@stinky:~/git/skaffold/examples/getting-started (master)$ sudo snap install multipass --beta --classic
Warning: flag --classic ignored for strictly confined snap multipass

multipass (candidate) 1.6.0-rc.265+g9d962ccd from Canonical✓ installed
Channel latest/beta for multipass is closed; temporarily forwarding to candidate.

$ du -sh /var/snap/*
# ...
6.9M	/var/snap/multipass
```

So note! -- multipass is a VM system for ubuntu, and these images take up space! Rapidly! Snaps when they build are in VMs of the different bases, eg. `core18` etc

Alternatively -- the VM's can be removed via multipass, `multipass purge` or `multipass delete <name>`

Useful `multipass` commands

`$ multipass list` -- lists out the machines and states
`$ multipass info <name>` -- shows status of a VM
`$ multipass stop <name>` -- stops a VM

More info at: https://ubuntu.com/server/docs/virtualization-multipass
