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

And immediately blocked with another error.

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

Hunch 1 -- I already have it running from a prior command `kubectl apply -f k8s` probably.

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ kubectl get all
NAME                                       READY   STATUS    RESTARTS   AGE
pod/worker-deployment-7c94ff9b64-t5h7z     1/1     Running   6          12d
pod/postgres-deployment-5b7fdb4969-kn6pr   1/1     Running   7          12d
pod/redis-deployment-58c4799ccc-9h5tb      1/1     Running   5          12d
pod/server-deployment-5567f99966-bbqzv     1/1     Running   7          12d
pod/server-deployment-5567f99966-xg2c5     1/1     Running   7          12d
pod/server-deployment-5567f99966-w5ptj     1/1     Running   6          12d

NAME                                  TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/kubernetes                    ClusterIP   10.152.183.1     <none>        443/TCP    13d
service/client-cluster-ip-service     ClusterIP   10.152.183.163   <none>        3000/TCP   12d
service/postgres-cluster-ip-service   ClusterIP   10.152.183.164   <none>        5432/TCP   12d
service/redis-cluster-ip-service      ClusterIP   10.152.183.250   <none>        6379/TCP   12d
service/server-cluster-ip-service     ClusterIP   10.152.183.165   <none>        5000/TCP   12d

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/worker-deployment     1/1     1            1           12d
deployment.apps/postgres-deployment   1/1     1            1           12d
deployment.apps/redis-deployment      1/1     1            1           12d
deployment.apps/server-deployment     3/3     3            3           12d

NAME                                             DESIRED   CURRENT   READY   AGE
replicaset.apps/worker-deployment-7c94ff9b64     1         1         1       12d
replicaset.apps/postgres-deployment-5b7fdb4969   1         1         1       12d
replicaset.apps/redis-deployment-58c4799ccc      1         1         1       12d
replicaset.apps/server-deployment-5567f99966     3         3         3       12d

ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ kubectl delete -f k8s/.
service "client-cluster-ip-service" deleted
persistentvolumeclaim "database-persistent-volume-claim" deleted
Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress
ingress.networking.k8s.io "ingress-service" deleted
service "postgres-cluster-ip-service" deleted
deployment.apps "postgres-deployment" deleted
service "redis-cluster-ip-service" deleted
deployment.apps "redis-deployment" deleted
service "server-cluster-ip-service" deleted
deployment.apps "server-deployment" deleted
deployment.apps "worker-deployment" deleted
Error from server (NotFound): error when deleting "k8s/client-deployment.yaml": deployments.apps "client-deployment" not found
[unable to recognize "k8s/certificate.yaml": no matches for kind "Certificate" in version "cert-manager.io/v1alpha2", unable to recognize "k8s/issuer.yaml": no matches for kind "ClusterIssuer" in version "cert-manager.io/v1alpha2"]


ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ kubectl get all
NAME                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.152.183.1   <none>        443/TCP   13d

```

So definitely had unneeded things running.

Same error.

Next up; try running commands from within the output.

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ kubectl --context microk8s create --dry-run=client -oyaml -f /home/ali/git/dkc-multi-k8s/k8s/client-deployment.yaml | kubectl --context microk8s apply -f -
deployment.apps/client-deployment created
```

Basically piping the commands in each step, which I think is what is happening behind the scenes.

Attempted skaffold again, and then looked at logs from kubectl.

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ kubectl logs pod/client-deployment-66b8c8b585-zdbnk
Error from server (BadRequest): container "client" in pod "client-deployment-66b8c8b585-zdbnk" is waiting to start: image can't be pulled
```

**1/24**

Now I start to suspect my `--default-repo=aliwatters` is not quite right. Does this need to be a fully qualified host?

```
    - pod/client-deployment-6cccdfbb7b-dstb7: container client is waiting to start: aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
 - deployment/client-deployment failed. Error: creating container client.
```

Trying `docker.io/aliwatters`

https://skaffold.dev/docs/environment/image-registries/

```
DEBU[0002] Pod "client-deployment-5ddb6d4db4-62mr7" scheduled: checking container statuses
 - deployment/client-deployment: container client is waiting to start: example.com/aliwatters/aliwatters_dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
```

The error above is seen with:

- `example.com/aliwatters`
- `docker.io/aliwatters`
- `dockerhub.com/aliwatters`
- `dockerhub.com`
- `docker.io`

Specifically

```
- pod/client-deployment-67886fcd47-nkxfn: container client is waiting to start: docker.io/aliwatters_dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
```

I'd expect it to be `docker.io/aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694` note "**/**" not "**\_**" -- why this. Underscore isn't a valid character in a name so is it just a placeholder?

Also digging in; that tag isn't available. Which makes sense, the tag is a git sha (I think skaffold is generating that) and I've added a yaml file.

```
$ git rev-parse HEAD
1dc48c4052aa79e520e5dd457f5deb65a8e9db82
```

So not this.

Trying something really nasty.

```
$ SHA=d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 /bin/bash deploy.sh
Sending build context to Docker daemon  57.34kB
Step 1/10 : FROM node:alpine as builder
 ---> d4edda39fb81
# ...

```

Manually building the image with the tag specified in the `skaffold` error and pushing to docker.io. Yuck. Well let's see...

```
https://hub.docker.com/layers/aliwatters/dkc-multi-client/d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694/images/sha256-fe178d01696740108d0ec47c2c0082289086d3442471b628d729bdc3cb068d50?context=repo
```

Now the tag exists.

```
DEBU[0005] Pod "client-deployment-84bdcdf9cd-pbhbk" scheduled: checking container statuses
 - deployment/client-deployment: container client is waiting to start: docker.io/aliwatters_dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
    - pod/client-deployment-84bdcdf9cd-pbhbk: container client is waiting to start: docker.io/aliwatters_dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694 can't be pulled
```

Same error.

Ugh. I found the problem -- my default repo is already docker.io or hub or whatever. So the command;

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ skaffold dev
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
 - deployment/client-deployment is ready.
Deployments stabilized in 2.314 seconds
Press Ctrl+C to exit
Watching for changes...
```

Works as expected! -- gah grief -- user error. But why? -- this I'm not going to debug further, but something to consider if I hit when using other container registries -- sidequest after the course will be to deploy _everything_ to Digital Ocean infrastructure; https://www.digitalocean.com/products/container-registry/

**Aside**: https://kubernetes.slack.com/join/signup#/ -- I'd love an invite there, can't signup with my gmail, I'll ask my work team if anyone has an in.

So at this point: `skaffold` is now serving Well, it's not.

I have a cached version from the browser, and from nginx I have the result;

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ curl -k -i https://k8s.course.local/
HTTP/2 404
server: nginx/1.19.2
date: Sun, 24 Jan 2021 15:50:46 GMT
content-type: text/html
content-length: 153
strict-transport-security: max-age=15724800; includeSubDomains

<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.19.2</center>
</body>
</html>
```

Changes to the files are picked up by skaffold.

```
 - deployment/client-deployment is ready.
Deployments stabilized in 2.314 seconds
Press Ctrl+C to exit
Watching for changes...
Syncing 1 files for aliwatters/dkc-multi-client:d7a991d86f537e4fe387ff2af82d4dec4b36e4cb2a6064069e7f71fea246f694
Watching for changes...
```

Something else to dig in to; troubleshooting, this section is going slowly, but of all the things I had the goal to understand in this course this part is it.

Relevant posts;
https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/learn/lecture/15271348#questions/8903404
https://github.com/StephenGrider/DockerCasts/blob/master/complex/skaffold.yaml
https://skaffold.dev/docs/pipeline-stages/port-forwarding/

**1/25**

Digging in some more and issues relating to pulling and pushing images are many;

Back to the examples from skaffold:

1. setup microk8s local registry

- `microk8s enable registry:size=20Gi` -- annoyingly 20Gi is minimum

2. `skaffold dev --default-repo=localhost:32000` -- inside examples folder `examples/getting-started`

```
$ skaffold dev --default-repo=localhost:32000
Listing files to watch...
 - skaffold-example
Generating tags...
 - skaffold-example -> localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce
Checking cache...
 - skaffold-example: Found Remotely
Tags used in deployment:
 - skaffold-example -> localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce@sha256:98741deac3e4370fc070835c30a55d5ce9dfd5f97966907c0be3c2bb0b720c6b
Starting deploy...
 - pod/getting-started created
Waiting for deployments to stabilize...
Deployments stabilized in 9.68776ms
Press Ctrl+C to exit
Watching for changes...
[getting-started] Hello world!
```

Now into the `examples/microservices` project

```
$ skaffold dev --default-repo=localhost:32000
# ...
Starting deploy...
 - deployment.apps/leeroy-web created
 - service/leeroy-app created
 - deployment.apps/leeroy-app created
Waiting for deployments to stabilize...
 - deployment/leeroy-web is ready. [1/2 deployment(s) still pending]
 - deployment/leeroy-app is ready.
Deployments stabilized in 2.359 seconds
Press Ctrl+C to exit
Watching for changes...
[leeroy-web] 2021/01/25 15:20:21 leeroy web server ready
[leeroy-app] 2021/01/25 15:20:21 leeroy app server ready
```

So working there too, now over to my project; `~/git/dkc-multi-k8s`

```
$ skaffold dev --default-repo=localhost:32000
Listing files to watch...
 - aliwatters/dkc-multi-client
Generating tags...
 - aliwatters/dkc-multi-client -> localhost:32000/aliwatters_dkc-multi-client:1dc48c4-dirty
Checking cache...
 - aliwatters/dkc-multi-client: Not found. Building
Building [aliwatters/dkc-multi-client]...
Sending build context to Docker daemon   55.3kB
Step 1/6 : FROM node:alpine
alpine: Pulling from library/node
0a6724ff3fcd: Pulling fs layer
42841052445f: Pulling fs layer
0ca42998fbf4: Pulling fs layer
ab7c5f8ccb9b: Pulling fs layer
ab7c5f8ccb9b: Waiting
0ca42998fbf4: Verifying Checksum
0ca42998fbf4: Download complete
0a6724ff3fcd: Verifying Checksum
0a6724ff3fcd: Download complete
0a6724ff3fcd: Pull complete
ab7c5f8ccb9b: Verifying Checksum
ab7c5f8ccb9b: Download complete
42841052445f: Verifying Checksum
42841052445f: Download complete
42841052445f: Pull complete
0ca42998fbf4: Pull complete
ab7c5f8ccb9b: Pull complete
Digest: sha256:9b731474409d0eb68a888963590d68385d3fcfe652042b5da2a71e0d64109172
Status: Downloaded newer image for node:alpine
 ---> 179fbd4d8e5c
Step 2/6 : WORKDIR "/app"
 ---> Running in 81c10900e332
 ---> 3367527b156a
Step 3/6 : COPY ./package.json ./
 ---> 469cb054a718
Step 4/6 : RUN npm install
 ---> Running in 69bf08a907dd
npm WARN deprecated @hapi/topo@3.1.6: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated @hapi/bourne@1.3.2: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated @hapi/hoek@8.5.1: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated @hapi/address@2.1.4: Moved to 'npm install @sideway/address'
npm WARN deprecated fsevents@1.2.13: fsevents 1 will break on node v14+ and could be using insecure binaries. Upgrade to fsevents 2.
npm WARN deprecated chokidar@2.1.8: Chokidar 2 will break on node v14+. Upgrade to chokidar 3 with 15x less dependencies.
npm WARN deprecated @hapi/joi@15.1.1: Switch to 'npm install joi'
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated request-promise-native@1.0.9: request-promise-native has been deprecated because it extends the now deprecated request package, see https://github.com/request/request/issues/3142
npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
npm WARN deprecated fsevents@1.2.13: fsevents 1 will break on node v14+ and could be using insecure binaries. Upgrade to fsevents 2.
npm WARN deprecated core-js@2.6.12: core-js@<3 is no longer maintained and not recommended for usage due to the number of issues. Please, upgrade your dependencies to the actual version of core-js@3.
npm WARN deprecated fsevents@1.2.13: fsevents 1 will break on node v14+ and could be using insecure binaries. Upgrade to fsevents 2.
npm WARN deprecated chokidar@2.1.8: Chokidar 2 will break on node v14+. Upgrade to chokidar 3 with 15x less dependencies.
npm WARN deprecated fsevents@2.1.2: "Please update to latest v2.3 or v2.2"
npm WARN deprecated eslint-loader@3.0.3: This loader has been deprecated. Please use eslint-webpack-plugin
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated @types/testing-library__dom@7.5.0: This is a stub types definition. testing-library__dom provides its own type definitions, so you do not need this installed.
npm WARN deprecated axios@0.18.0: Critical security vulnerability fixed in v0.21.1. For more information, see https://github.com/axios/axios/pull/3410

added 1960 packages, and audited 1961 packages in 1m

79 packages are looking for funding
  run `npm fund` for details

5 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm notice
npm notice New patch version of npm available! 7.4.0 -> 7.4.3
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v7.4.3>
npm notice Run `npm install -g npm@7.4.3` to update!
npm notice
 ---> 723757e2b396
Step 5/6 : COPY . .
 ---> d578bd92d0b2
Step 6/6 : CMD ["npm", "run", "start"]
 ---> Running in 681ff4bac913
 ---> b8b87735cb59
Successfully built b8b87735cb59
Successfully tagged localhost:32000/aliwatters_dkc-multi-client:1dc48c4-dirty
Tags used in deployment:
 - aliwatters/dkc-multi-client -> localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51
Starting deploy...
 - deployment.apps/client-deployment created
Waiting for deployments to stabilize...
 - deployment/client-deployment: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled
    - pod/client-deployment-74cffbf4c7-th85s: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled
    - pod/client-deployment-74cffbf4c7-n65tl: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled
    - pod/client-deployment-74cffbf4c7-xl8h6: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled
 - deployment/client-deployment failed. Error: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled.
Cleaning up...
 - deployment.apps "client-deployment" deleted
exiting dev mode because first deploy failed: 1/1 deployment(s) failed
```

Same situation; this is the error;

```
    - pod/client-deployment-74cffbf4c7-xl8h6: container client is waiting to start: localhost:32000/aliwatters_dkc-multi-client:b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51 can't be pulled
```

This looks like it works;

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold)$ more skaffold.yaml
apiVersion: skaffold/v2beta11
kind: Config
build:
  artifacts:
  - image: dkc-multi-client
    context: client
    sync:
      manual:
      - src: '**/*.css'
        dest: .
      - src: '**/*.html'
        dest: .
      - src: '**/*.js'
        dest: .
    docker:
      dockerfile: Dockerfile.dev
  local:
    push: false
deploy:
  kubectl:
    manifests:
    - k8s/client-deployment.yaml
```

Note: the change is that I've removed `aliwatters` from the image name.

So at this point; the `skaffold dev --default-repo=localhost:32000` command works -- but on loading the page, it's a 404 error.

```
$ docker images
REPOSITORY                                    TAG                                                                IMAGE ID            CREATED             SIZE
localhost:32000/dkc-multi-client              1dc48c4-dirty                                                      b8b87735cb59        9 minutes ago       425MB
localhost:32000/dkc-multi-client              b8b87735cb591a0ca3041ab9c347d2000a56c33dd26953d87ef5158634562a51   b8b87735cb59        9 minutes ago       425MB
```

Which at least shows the build is working and interfacing with docker.

The change detection in `skaffold` is working;

```
Watching for changes...
Generating tags...
 - dkc-multi-client -> localhost:32000/dkc-multi-client:1dc48c4-dirty
Checking cache...
 - dkc-multi-client: Not found. Building
Building [dkc-multi-client]...
Sending build context to Docker daemon   68.1kB
Step 1/6 : FROM node:alpine
 ---> 179fbd4d8e5c
Step 2/6 : WORKDIR "/app"
 ---> Using cache
 ---> 3367527b156a
Step 3/6 : COPY ./package.json ./
 ---> Using cache
 ---> 469cb054a718
Step 4/6 : RUN npm install
 ---> Using cache
 ---> 723757e2b396
Step 5/6 : COPY . .
 ---> adf93954db53
Step 6/6 : CMD ["npm", "run", "start"]
 ---> Running in f8b3e6a6446d
 ---> 9c0c9fbe6c7e
Successfully built 9c0c9fbe6c7e
Successfully tagged localhost:32000/dkc-multi-client:1dc48c4-dirty
Tags used in deployment:
 - dkc-multi-client -> localhost:32000/dkc-multi-client:9c0c9fbe6c7ec47678e0b602bd97231c21cc1508495c3b1f8d38fb937059b6b3
Starting deploy...
Waiting for deployments to stabilize...
 - deployment/client-deployment is ready.
Deployments stabilized in 1.216 second
Watching for changes...
```

So if only I can get everything connected up -- this should all work!

Note: this all works so nicely with `getting-started` app in go.

```
Successfully tagged localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce-dirty
The push refers to repository [localhost:32000/skaffold-example]
f314433c506e: Preparing
1b3ee35aacca: Preparing
1b3ee35aacca: Layer already exists
f314433c506e: Pushed
v1.18.0-2-gf0bfcccce-dirty: digest: sha256:df894399994be7e3532d06b94ee0ea53399b3499e570ceb7a2395d9831b8b014 size: 739
Tags used in deployment:
 - skaffold-example -> localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce-dirty@sha256:df894399994be7e3532d06b94ee0ea53399b3499e570ceb7a2395d9831b8b014
Starting deploy...
 - pod/getting-started configured
Waiting for deployments to stabilize...
Deployments stabilized in 5.399407ms
Watching for changes...
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
[getting-started] Hello Skaffold!
Generating tags...
 - skaffold-example -> localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce
Checking cache...
 - skaffold-example: Found Remotely
Tags used in deployment:
 - skaffold-example -> localhost:32000/skaffold-example:v1.18.0-2-gf0bfcccce@sha256:98741deac3e4370fc070835c30a55d5ce9dfd5f97966907c0be3c2bb0b720c6b
Starting deploy...
 - pod/getting-started configured
Waiting for deployments to stabilize...
Deployments stabilized in 7.214464ms
Watching for changes...
[getting-started] Hello world!
[getting-started] Hello world!
[getting-started] Hello world!
# ^C
Cleaning up...
 - pod "getting-started" deleted
```

From just alternating the `main.go` code;

```
ali@stinky:~/git/skaffold/examples/getting-started (master)$ cat main.go
package main

import (
	"fmt"
	"time"
)

func main() {
	for {
		fmt.Println("Hello world!")

		time.Sleep(time.Second * 1)
	}
}
```

There is a good chance here that the course at this point hasn't set up the `ingress` service, no load-balancing etc -- so my plan now is to add all the other config for the rest of the components and see what happens.
