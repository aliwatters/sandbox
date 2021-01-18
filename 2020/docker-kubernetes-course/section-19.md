## Section 19 -- local development with skaffold

https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/learn/lecture/15271340

https://skaffold.dev/

Two modes:

1. rebuild the images on file changes
2. inject the files into the container

My installation: https://snapcraft.io/skaffold - there's a snap!

```
$ sudo snap install skaffold
skaffold v0.25.0 from dt9394 (terraform-snap) installed
```

Stephen is on v0.32.0, so we're a little bit behind on a latest/stable release.

Next create a `skaffold.yml` file in the root of the project. See the `dkc-mutli-k8s` project... urgh **mutli**. NOTE: `yml` not `yaml` ... so not consistent.

The `sync` option is very interesting, globs on the patterns to run in mode 2, INJECT the files. Changes to any other files are mode 1, REBUILD the image.

Ok the snap is too old, updating. Oh no, the snaps are really old, `0.26` is the latest.

Aside: I'm going to try and create a new snap.

```
$ skaffold dev
WARN[0000] config version (skaffold/v1beta2) out of date: upgrading to latest (skaffold/v1beta7)
2021/01/18 08:21:03 Unable to read "/home/ali/snap/skaffold/1/.docker/config.json": open /home/ali/snap/skaffold/1/.docker/config.json: no such file or directory
Generating tags...
 - aliwatters/dkc-multi-client -> WARN[0002] Unable to find git commit: starting command &{git [git rev-parse --short HEAD] [] client <nil> 0xc0005ac850 0xc0005ac860 [] <nil> <nil> <nil> <nil> 0xc00079ac20 false [] [0xc0005ac850 0xc0005ac860] [0xc0005ac848 0xc0005ac858] [] <nil> <nil>}: exec: "git": executable file not found in $PATH
aliwatters/dkc-multi-client:dirty
Tags generated in 609.085µs
Starting build...
Building [aliwatters/dkc-multi-client]...
FATA[0002] exiting dev mode because first run failed: build failed: building [aliwatters/dkc-multi-client]: build artifact: docker build: Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Post http://%2Fvar%2Frun%2Fdocker.sock/v1.24/build?buildargs=null&cachefrom=null&cgroupparent=&cpuperiod=0&cpuquota=0&cpusetcpus=&cpusetmems=&cpushares=0&dockerfile=Dockerfile.dev&labels=null&memory=0&memswap=0&networkmode=&rm=0&shmsize=0&t=aliwatters%2Fdkc-multi-client%3Adirty&target=&ulimits=null: dial unix /var/run/docker.sock: connect: permission denied
```

Lots to debug there, but it's a holiday today (MLK) and I'm doing family stuff, so going to stop for now.

## Creating a new snap.

https://ubuntu.com/tutorials/create-your-first-snap#2-getting-started
