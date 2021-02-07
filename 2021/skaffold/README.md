# Doing a little skaffold dev!

**1/29** (moved on 1/31)

https://github.com/GoogleContainerTools/skaffold/issues/5284 -- this is the issue to develop against.

Note: figuring out github actoins here [Github Actions](../github-actions/README.md)

## Preliminary work on skaffold for dev

```
ali@stinky:~/git/skaffold (master)$ git remote add upstream git@github.com:GoogleContainerTools/skaffold.git

ali@stinky:~/git/skaffold (master)$ git remote remove origin

# Here: fork to aliwatters on github

ali@stinky:~/git/skaffold (master)$ git remote add origin git@github.com:aliwatters/skaffold.git

ali@stinky:~/git/skaffold (master)$ git remote -v
origin	git@github.com:aliwatters/skaffold.git (fetch)
origin	git@github.com:aliwatters/skaffold.git (push)
upstream	git@github.com:GoogleContainerTools/skaffold.git (fetch)
upstream	git@github.com:GoogleContainerTools/skaffold.git (push)

ali@stinky:~/git/skaffold (master)$ git pull origin master
From github.com:aliwatters/skaffold
 * branch                master     -> FETCH_HEAD
 * [new branch]          master     -> origin/master
Already up to date.

ali@stinky:~/git/skaffold (master)$ git pull upstream master
From github.com:GoogleContainerTools/skaffold
 * branch                master     -> FETCH_HEAD
 * [new branch]          master     -> upstream/master
Already up to date.
```

Now test that I can run dev on skaffold see:

```
ali@stinky:~/git/skaffold (master)$ make
hack/generate-statik.sh
Installing go-licenses
/tmp/generate-statik.95kJlP ~/git/skaffold
go: creating new go.mod: module tmp
go: downloading github.com/google/go-licenses v0.0.0-20201026145851-73411c8fa237
go: github.com/google/go-licenses upgrade => v0.0.0-20201026145851-73411c8fa237
go: downloading github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b
go: downloading github.com/otiai10/copy v1.2.0
go: downloading github.com/spf13/cobra v0.0.5
go: downloading github.com/google/licenseclassifier v0.0.0-20190926221455-842c0d70d702
go: downloading golang.org/x/tools v0.0.0-20191118222007-07fc4c7f2b98
go: downloading gopkg.in/src-d/go-git.v4 v4.13.1
go: downloading github.com/spf13/pflag v1.0.5
go: downloading github.com/inconshreveable/mousetrap v1.0.0
go: downloading gopkg.in/src-d/go-billy.v4 v4.3.2
go: downloading github.com/src-d/gcfg v1.4.0
go: downloading github.com/sergi/go-diff v1.0.0
go: downloading golang.org/x/crypto v0.0.0-20191117063200-497ca9f6d64f
go: downloading github.com/emirpasic/gods v1.12.0
go: downloading github.com/jbenet/go-context v0.0.0-20150711004518-d14ea06fba99
go: downloading gopkg.in/warnings.v0 v0.1.2
go: downloading golang.org/x/sys v0.0.0-20191119060738-e882bf8e40c2
go: downloading github.com/kevinburke/ssh_config v0.0.0-20190725054713-01f96b0aa0cd
go: downloading github.com/xanzy/ssh-agent v0.2.1
go: downloading golang.org/x/net v0.0.0-20191119073136-fc4aabc6c914
go: downloading github.com/mitchellh/go-homedir v1.1.0
~/git/skaffold
Collecting licenses
Collecting schemas
Installing statik tool
~/git/skaffold/hack/tools ~/git/skaffold
~/git/skaffold
mkdir -p ./out
GOOS=linux GOARCH=amd64 CGO_ENABLED=1 go b
uild -gcflags="all=-N -l" -tags "osusergo netgo static_build release" -ldflags " -X github.com/GoogleContainerTools/skaffold/pkg/skaffold/version.version=v1.18.0-23-g1cdc543e7 -X github.com/GoogleContainerTools/skaffold/pkg/skaffold/version.buildDate=2021-01-29T06:51:57Z -X github.com/GoogleContainerTools/skaffold/pkg/skaffold/version.gitCommit=1cdc543e71d8cfb73adeaec0d46a7906e956e1be -X github.com/GoogleContainerTools/skaffold/pkg/skaffold/version.gitTreeState=clean -s -w  -extldflags \"-static\"" -o out/skaffold github.com/GoogleContainerTools/skaffold/cmd/skaffold

ali@stinky:~/git/skaffold (master)$ ./out/skaffold version
v1.18.0-23-g1cdc543e7
```

Note; `make test` worked too.

```
ali@stinky:~/git/skaffold (master)$ make test
go test -count=1 -race -short -timeout=90s ./pkg/skaffold/... ./cmd/... ./hack/... ./pkg/webhook/...
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/apiversion	0.119s
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/build/bazel	0.422s
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/build/cache	0.589s
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/build/custom	0.515s
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/build	1.018s
ok  	github.com/GoogleContainerTools/skaffold/pkg/skaffold/build/buildpacks	1.058s

# ...

Successfully built 6b5107ad713f
Successfully tagged gen-proto:latest

Generated proto files are updated!
PASSED hack/test-generated-proto.sh in 1s
Running linters...
RUN hack/boilerplate.sh
PASSED hack/boilerplate.sh in 0s
RUN hack/gofmt.sh
PASSED hack/gofmt.sh in 1s
RUN hack/golangci-lint.sh
PASSED hack/golangci-lint.sh in 2s

```

**2/6/2021**

Running through the commands suggested by Marlon on

```
$ multipass launch --name microk8s-vm

$ multipass list
Name                    State             IPv4             Image
microk8s-vm             Running           10.117.155.213   Ubuntu 20.04 LTS
```

Now I have a multipass vm.

```
ali@stinky:~/git/dkc-multi-k8s (feature-skaffold-minimal)$ docker save aliwatters/dkc-multi-server | multipass transfer - microk8s-vm:aliwatters_dkc-multi-server.tar
```

Now works as expected.

Testing -- `make quicktest` -- runs only the changed files.
