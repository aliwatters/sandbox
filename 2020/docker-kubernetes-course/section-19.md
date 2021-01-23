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

**1/19**

Note: here, I'm going off on a tanget trying to get a new version of this snap built. [Building snaps side quest](../2021/snapcraft/README.md)

Well - that was fun.

**1/22**

Ended up getting blocked on that due, but understand snaps a lot better, made some contributions etc and posted to the forum asking for more info.

Installed skaffold with

```
wget https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
sudo mv skaffold-linux-amd64 /usr/local/bin
sudo chmod +x /usr/local/bin/
skaffold version
# v1.17.2 (better than v0.25.0!)
```

Moving on with the course :)

And immediatly blocked with another error.

Created a github issue: https://github.com/GoogleContainerTools/skaffold/issues/5283 and a stackoverflow: https://stackoverflow.com/questions/65855359/skaffold-and-microk8s-getting-started-x509-certificate-signed-by-unknown

```
$ skaffold dev --default-repo=aliwatters
Listing files to watch...
 - skaffold-example
Generating tags...
 - skaffold-example -> aliwatters/skaffold-example:v1.18.0-2-gf0bfcccce
Checking cache...
 - skaffold-example: Not found. Building
Building [skaffold-example]...
Sending build context to Docker daemon  3.072kB
Step 1/8 : FROM golang:1.12.9-alpine3.10 as builder
 ---> e0d646523991
Step 2/8 : COPY main.go .
 ---> Using cache
 ---> fb29e25db0a3
Step 3/8 : ARG SKAFFOLD_GO_GCFLAGS
 ---> Using cache
 ---> aa8dd4cbab42
Step 4/8 : RUN go build -gcflags="${SKAFFOLD_GO_GCFLAGS}" -o /app main.go
 ---> Using cache
 ---> 9a666995c00a
Step 5/8 : FROM alpine:3.10
 ---> be4e4bea2c2e
Step 6/8 : ENV GOTRACEBACK=single
 ---> Using cache
 ---> bdb74c01e0b9
Step 7/8 : CMD ["./app"]
 ---> Using cache
 ---> 15c248dd54e9
Step 8/8 : COPY --from=builder /app .
 ---> Using cache
 ---> 73564337b083
Successfully built 73564337b083
Successfully tagged aliwatters/skaffold-example:v1.18.0-2-gf0bfcccce
The push refers to repository [docker.io/aliwatters/skaffold-example]
37806ae41d23: Preparing
1b3ee35aacca: Preparing
37806ae41d23: Pushed
1b3ee35aacca: Pushed
v1.18.0-2-gf0bfcccce: digest: sha256:a8defaa979650baea27a437318a3c4cd51c44397d6e2c1910e17d81d0cde43ac size: 739
Tags used in deployment:
 - skaffold-example -> aliwatters/skaffold-example:v1.18.0-2-gf0bfcccce@sha256:a8defaa979650baea27a437318a3c4cd51c44397d6e2c1910e17d81d0cde43ac
Deploy Failed. Could not connect to cluster microk8s due to "https://127.0.0.1:16443/version?timeout=32s": x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "10.152.183.1"). Check your connection for the cluster.
```

So some kind of self signed cert issue, hopefully there's a flag to just ignore!

**1/23**

A little more complex. Skaffold looks at the config in `~/.kube/config` and uses that to understand how things are set up on any given system. I hadn't set that up.

Also -- aliases can cause issues -- so; this is the quick start.

```
$ sudo snap unalias kubectl
$ sudo snap install kubectl --classic
$ microk8s.kubectl config view --raw > $HOME/.kube/config
$ skaffold dev --default-repo=<your-docker-repository>
```

My full output is as follows: (note this is on the getting-started example in the skaffold repo; https://github.com/GoogleContainerTools/skaffold/tree/master/examples/getting-started) the issue was answered here; https://github.com/GoogleContainerTools/skaffold/issues/5283

```
$ sudo snap unalias kubectl
# just in case

ali@stinky:~/git/skaffold/examples/getting-started (master)$ sudo snap install kubectl --classic
kubectl 1.20.2 from Canonical✓ installed

ali@stinky:~/git/skaffold/examples/getting-started (master)$ which kubectl
/snap/bin/kubectl

ali@stinky:~/git/skaffold/examples/getting-started (master)$ microk8s.kubectl config view --raw > $HOME/.kube/config

ali@stinky:~/git/skaffold/examples/getting-started (master)$ skaffold dev --default-repo=aliwatters
Listing files to watch...
 - skaffold-example
Generating tags...
 - skaffold-example -> aliwatters/skaffold-example:v1.18.0-2-gf0bfcccce
Checking cache...
 - skaffold-example: Found Remotely
Tags used in deployment:
 - skaffold-example -> aliwatters/skaffold-example:v1.18.0-2-gf0bfcccce@sha256:a8defaa979650baea27a437318a3c4cd51c44397d6e2c1910e17d81d0cde43ac
Starting deploy...
 - pod/getting-started created
Waiting for deployments to stabilize...
Deployments stabilized in 23.793238ms
Press Ctrl+C to exit
Watching for changes...
[getting-started] Hello world!
[getting-started] Hello world!
[getting-started] Hello world!
# ^C
Cleaning up...
 - pod "getting-started" deleted
```

Now to try in my k8s project!

... well that didn't work :/

```
$ skaffold dev --default-repo=aliwatters
WARN[0000] The semantics of sync has changed, the folder structure is no longer flattened but preserved (see https://skaffold.dev/docs/how-tos/filesync/). The likely impacted patterns in your skaffold yaml are: [**/*.css **/*.html **/*.js]
Listing files to watch...
 - aliwatters/dkc-multi-client
Generating tags...
 - aliwatters/dkc-multi-client -> aliwatters/dkc-multi-client:1dc48c4
Checking cache...
 - aliwatters/dkc-multi-client: Found Locally
Tags used in deployment:
 - aliwatters/dkc-multi-client -> aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694
Starting deploy...
 - deployment.apps/client-deployment created
Waiting for deployments to stabilize...
 - deployment/client-deployment: creating container client
    - pod/client-deployment-8c8b897f4-fclsj: creating container client
    - pod/client-deployment-8c8b897f4-s5wn8: creating container client
    - pod/client-deployment-8c8b897f4-ds9zj: container client is waiting to start: aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
 - deployment/client-deployment failed. Error: creating container client.
Cleaning up...
 - deployment.apps "client-deployment" deleted
exiting dev mode because first deploy failed: 1/1 deployment(s) failed
```

So many things that it could be here; my version of skaffold is much newer than that in the course, so the yaml could be out of date.

Running with `debug`.

```
$ skaffold dev --default-repo=aliwatters --verbosity='debug'
# ...

DEBU[0003] Running command: [kubectl --context microk8s rollout status deployment client-deployment --namespace default --watch=false]
DEBU[0004] Command output: [Waiting for deployment "client-deployment" rollout to finish: 0 of 3 updated replicas are available...
]
DEBU[0004] Pod "client-deployment-f94c595c9-jvlmk" scheduled: checking container statuses
DEBU[0004] Pod "client-deployment-f94c595c9-vmh2x" scheduled: checking container statuses
DEBU[0004] Pod "client-deployment-f94c595c9-64kbm" scheduled: checking container statuses
 - deployment/client-deployment: creating container client
    - pod/client-deployment-f94c595c9-jvlmk: creating container client
    - pod/client-deployment-f94c595c9-vmh2x: creating container client
    - pod/client-deployment-f94c595c9-64kbm: container client is waiting to start: aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
 - deployment/client-deployment failed. Error: creating container client.

# cleanup
```

So that's where to debug next.
