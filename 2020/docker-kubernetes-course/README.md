# Docker and Kubernetes Course

https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/

Good instructor on this course, Stephen Girder, hope to fill in a few gaps on docker and get fully up to speed on kubernetes.

## Section 1-3 - basics

Lots of docker info, good diagrams, mostly things I already know. One nice thing to learn is that docker on Mac/Win both use a VM and overlay the docker server on top of that.

`docker build -t aliwatters/redis:latest .` -- tags images that I build, version is technically the "tag" everything else is the project.

Creating images from running containers is via `docker commit -c 'CMD ["redis-server"]' <running-image-id>` -- much better to use Dockerfiles, but interesting.

## Section 4 - a simple project

Course project, nodejs web app. All in `simpleweb`.

```
 $ docker build -t aliwatters/simpleweb .
 $ docker run -p 5000:8080 aliwatters/simpleweb
```

Visit: http://localhost:5000/

**Debug**: `docker run -it aliwatters/simpleweb sh`

## Section 5 - docker-compose

Server counting app, see `visits` directory. Introduce `docker-compose` -- restarts is something I'd not gone into before.

## Section 6 - production grade workflow

Nice, using gitub and feature branches. Changes to the course;

`npx create-react-app frontend` -- rather than install `create-react-app` globally

Yarn is used by default, not npm. Should be able to use interchangebly.

Note; remove `node_modules` before building image. This save 155mb being copied in! (`create-react-app` installs this, only needed in the container which we're setting up for dev)

**Lesson 72**:

`docker run -it -p 3000:3000 CONTAINER_ID` -- needs the `-it`

**Lesson 75**:

docker volumes, great. `$ docker run -p 3000:3000 -v /app/node_modules -v $PWD:/app bb8db8695daf `

Note: the `-v /app/node_modules` -- doesn't exist in the host, but adds a volume for the image.

**Lesson 76**:

`docker-compose` version of the commands above.

**Lesson 83**:

On the `docker-compose` test setup. You can still `exec` into the running container and use the ui for react tests. But `docker attach <id>` won't work as explained in the video.

```
$ docker ps
CONTAINER ID        IMAGE                                     COMMAND                  CREATED             STATUS              PORTS                    NAMES
3791196255d8        docker-kubernetes-course-frontend_tests   "docker-entrypoint.s…"   52 seconds ago      Up 51 seconds                                docker-kubernetes-course-frontend_tests_1
fc7561af990d        docker-kubernetes-course-frontend_web     "docker-entrypoint.s…"   53 seconds ago      Up 51 seconds       0.0.0.0:3000->3000/tcp   docker-kubernetes-course-frontend_web_1

$ docker exec -it 3791196255d8 npm run test
 PASS  src/App.test.js
  ✓ renders react link (68 ms)
  ✓ it renders without crashing (14 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.206 s
Ran all test suites.

Watch Usage: Press w to show more.
```

Not perfect either, and as the default is watch mode anyway... not sure if it's that useful.

**Lesson 90**: Multi-step builds

Note there is some issues with named builds in AWS right now;

```
updated 10-1-2020

In the next lecture, we will be creating a multi-step build in our production Dockerfile. AWS currently will fail if you attempt to use a named builder as shown.

To remedy this, we should create an unnamed builder like so:

Instead of this:

    FROM node:alpine as builder
    WORKDIR '/app'
    COPY package.json .
    RUN npm install
    COPY . .
    RUN npm run build

    FROM nginx
    COPY --from=builder /app/build /usr/share/nginx/html

Do this:

    FROM node:alpine
    WORKDIR '/app'
    COPY package.json .
    RUN npm install
    COPY . .
    RUN npm run build

    FROM nginx
    COPY --from=0 /app/build /usr/share/nginx/html
```

So -- use the step number and leave out the name.

## Section 7 - Deploy to AWS

**Lesson 100+**:
AWS Elastic Beanstalk deployment. Changes in AWS mean;

> When creating our Elastic Beanstalk environment in the next lecture, we need to select **Docker running on 64bit Amazon Linux** instead of _Docker running on 64bit Amazon Linux 2_. This will ensure that our container is built using the Dockerfile and not the compose file.

Note: I also set up a new user, with only permissions on AWS ElasticBeanstalk (for now) for this course.

Created `DockerKubernetesCourseFrontend-env` environment and `docker-kubernetes-course-frontend` application.

Ok ran through all the steps in lessons, and https://github.com/aliwatters/docker-kubernetes-course-frontend -- now deploys to elasticbeanstalk on merge to the `main` branch.

![Travis CI](./img/simple-travis-ci.png)

![Running App](./img/simple-running-app.png)

## Section 8 - Multi-container app

Building an over the top fibonacci system. Note: pretty much a JS section, skippable as no docker or kubernetes content. I'm going to do it... might be a completionist.

https://github.com/aliwatters/docker-kubernetes-course-complex

## Section 9 - Dockerizing the services

Note: debugging of the redis connections is really tricky with the `retry_strategy` set to `() => 1000`. Replace with;

```
{
  ... ,
  retry_strategy: (err) => {
    console.error('REDIS', err);
    return 1000;
  }
}
```

actually outputs the errors.

## Section 10 & 11 - multicontainer hosting on AWS

Via elastic beanstalk and travis. Lots of detail in the [repo](https://github.com/aliwatters/docker-kubernetes-course-complex) and [AWS Cheatsheet](./AWS-cheatsheet.md)

Note: gotcha on travis, `docker push` doesn't die with an error code if fails authentication. Open up the drop downs to see errors as needed! I had an error in a password at one point.

![DockerHub](./img/docker-hub-images.png)

![TravisCI Log](./img/travis-push-log.png)

![AWS ELB](./img/dkcc-elb-running.png)

![Running App](./img/dkcc-running-app.png)

## Section 12 - kubernetes

Explanation, and note use `image: stephengrider/multi-client` as breaking changes have been introduced on the client.

Note: `minikube` is used in the course, I'm using `microk8s`. I'll note any differences.

First difference; `minikube ip` works great, `microk8s ip` isn't a command. You have to look for the ip of the docker or vxlan.calico interfaces in `ifconfig`. In my case; the ips are `10.1.134.64` and `172.17.0.1`.

[The running app http://172.17.0.1:31515/](http://172.17.0.1:31515/)

![app running on kubernetes](./img/client-on-kubernetes.png)

Also:

```
$ kubectl describe services
Name:              kubernetes
Namespace:         default
Labels:            component=apiserver
                   provider=kubernetes
Annotations:       <none>
Selector:          <none>
Type:              ClusterIP
IP Families:       <none>
IP:                10.152.183.1
IPs:               10.152.183.1
Port:              https  443/TCP
TargetPort:        16443/TCP
Endpoints:         192.168.86.104:16443
Session Affinity:  None
Events:            <none>
```

The Endpoint (`192.168.86.104:31515`) here also has the app running. So that's three IPs that could be what I'm looking for, `192.168.86.104`, `10.1.134.64` and `172.17.0.1`.

Posted a [feature](https://github.com/ubuntu/microk8s/issues/1836) request on the microk8s github, this seems way too complex for no good reason.

## Section 13 - kubernetes deployments

Deployments detail how to organize a number of pods. Think: `deployments -< pods -< containers`

### Commands:

`kubectl apply -f client-pod.yaml` -- sets up the objects in the file `client-pod.yaml`
`kubectl delete -f client-pod.yaml` -- tearsdown the objects in the file `client-pod.yaml`

Note: `kubectl delete` is the one situation where we issue imperative commands, vs declarative config files.

```
$ kubectl apply -f client-deployment.yaml
deployment.apps/client-deployment created
$ kubectl get pods
NAME                                 READY   STATUS    RESTARTS   AGE
client-deployment-7cb6c958f7-jdd8p   1/1     Running   0          11s
$ kubectl get deployments
NAME                READY   UP-TO-DATE   AVAILABLE   AGE
client-deployment   1/1     1            1           45s
```

Note: on minikube, internal IPs are not available on the host machine, but on microk8s they are;

```
$ kubectl get pods -o wide
NAME                                 READY   STATUS    RESTARTS   AGE     IP             NODE     NOMINATED NODE   READINESS GATES
client-deployment-7cb6c958f7-jdd8p   1/1     Running   0          5m49s   10.1.134.104   stinky   <none>           <none>

$ curl http://10.1.134.104:3000/
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"><meta name="theme-color" content="#000000"><link rel="manifest" href="/manifest.json"><link rel="shortcut icon" href="/favicon.ico"><title>React App</title><link href="/static/css/main.c17080f1.css" rel="stylesheet"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script type="text/javascript" src="/static/js/main.a2449523.js"></script></body></html>
```

Because `minikube` runs a VM, internal resources are hidden away. On `microk8s` the host takes the place of the VM (it's already linux!) so uses the native networking layer (et al). So internal addresses are available.

Keep in mind, the IPs pods are assigned will change though, it's better to use the external ip.

**Lesson 214** -- redeploying images. Turns out rebuilding a deployment based on an updated image is a pita. Tags with the versions are needed in the build step, and the `<deployment>.yaml` file would need updated in there.

https://github.com/kubernetes/kubernetes/issues/33664

Updating image version via command;

```
$ kubectl set image deployment/client-deployment client=stephengrider/multi-client:v5
deployment.apps/client-deployment image updated
$ kubectl get pods
NAME                                 READY   STATUS              RESTARTS   AGE
client-deployment-7cb6c958f7-jdd8p   1/1     Running             0          23h
client-deployment-59b7f8c74b-mjrf2   0/1     ContainerCreating   0          10s
$ kubectl get pods
NAME                                 READY   STATUS        RESTARTS   AGE
client-deployment-59b7f8c74b-mjrf2   1/1     Running       0          16s
client-deployment-7cb6c958f7-jdd8p   0/1     Terminating   0          23h
$ kubectl get pods
NAME                                 READY   STATUS    RESTARTS   AGE
client-deployment-59b7f8c74b-mjrf2   1/1     Running   0          105s
```

**Lesson 217-219** -- vm docker, client link.

Notes: I'm running microk8s, so no virtual machine. In the course they run `$ eval $(minikube docker-env)` at that point docker-client is linked to the docker server within the minikube VM.

Note: configs I used in section this are in the [dck-simple-k8s directory](./dkc-simple-k8s)

## Section 14 - a multi-container k8s deployment

Note: configs I use in section this are in the [complex-219 directory](./complex-219)

**Lesson 229** -- combining k8s config files

The course is making 11 or so separate files, one for each component. It's possible to combine into a single file.

Basically -- separate each file with a `---` eg.

```
apiVersion: apps/v1
kind: Deployment
...
---
apiVersion: v1
kind: Service
...
---
# more config etc
```

Gut check, I prefer the single file per component approach, with a good naming convention very obvious where the config is.

**Lesson 231** -- applying

```
ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ ls
client-cluster-ip-service.yaml  server-cluster-ip-service.yaml  worker-deployment.yaml
client-deployment.yaml          server-deployment.yaml

ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl apply -f .
service/client-cluster-ip-service unchanged
deployment.apps/client-deployment unchanged
service/server-cluster-ip-service created
deployment.apps/server-deployment created
deployment.apps/worker-deployment created

ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl get all
NAME                                     READY   STATUS    RESTARTS   AGE
pod/client-deployment-7cb6c958f7-8xdsf   1/1     Running   0          8h
pod/client-deployment-7cb6c958f7-vcszh   1/1     Running   0          8h
pod/client-deployment-7cb6c958f7-rx958   1/1     Running   0          8h
pod/server-deployment-9bff8dfb-bxpwc     1/1     Running   0          88s
pod/worker-deployment-666c96ffc5-dtqmd   1/1     Running   0          88s
pod/server-deployment-9bff8dfb-fqvwh     1/1     Running   0          88s
pod/server-deployment-9bff8dfb-rhvjw     1/1     Running   0          88s

NAME                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/kubernetes                  ClusterIP   10.152.183.1     <none>        443/TCP    8h
service/client-cluster-ip-service   ClusterIP   10.152.183.60    <none>        3000/TCP   8h
service/server-cluster-ip-service   ClusterIP   10.152.183.138   <none>        5000/TCP   88s

NAME                                READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/client-deployment   3/3     3            3           8h
deployment.apps/worker-deployment   1/1     1            1           88s
deployment.apps/server-deployment   3/3     3            3           88s

NAME                                           DESIRED   CURRENT   READY   AGE
replicaset.apps/client-deployment-7cb6c958f7   3         3         3       8h
replicaset.apps/worker-deployment-666c96ffc5   1         1         1       88s
replicaset.apps/server-deployment-9bff8dfb     3         3         3       88s


ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl logs pod/server-deployment-9bff8dfb-fqvwh

> @ start /app
> node index.js

Listening
{ Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1161:14)
  errno: 'ECONNREFUSED',
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 5432 }

```

Sweet, all running. At this point the connection error is expected as no connection information to redis/postgres has been provided, and redis/postgres has been setup.

There is an error in the course dialogue at this point, lesson 230 ~4:20. `5432` is postgres default port, why would a redis library even try that port.

This is proved by looking at the worker logs (which only connects to redis)

```
ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl logs pod/worker-deployment-666c96ffc5-dtqmd

> @ start /app
> node index.js

# note: no output
```

**Lesson 234** -- redis and postgres setup

After running `kubectl apply -f .` -- I have:

```
ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl get all
NAME                                       READY   STATUS             RESTARTS   AGE
pod/client-deployment-7cb6c958f7-8xdsf     1/1     Running            0          38h
pod/client-deployment-7cb6c958f7-vcszh     1/1     Running            0          38h
pod/client-deployment-7cb6c958f7-rx958     1/1     Running            0          38h
pod/server-deployment-9bff8dfb-rhvjw       1/1     Running            28         29h
pod/server-deployment-9bff8dfb-fqvwh       1/1     Running            28         29h
pod/server-deployment-9bff8dfb-bxpwc       1/1     Running            28         29h
pod/worker-deployment-666c96ffc5-dtqmd     1/1     Running            28         29h
pod/redis-deployment-58c4799ccc-4fgmp      1/1     Running            0          7m11s
pod/postgres-deployment-6796b9c68d-tfgh5   0/1     CrashLoopBackOff   1          20s

NAME                                  TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/kubernetes                    ClusterIP   10.152.183.1     <none>        443/TCP    38h
service/client-cluster-ip-service     ClusterIP   10.152.183.60    <none>        3000/TCP   38h
service/server-cluster-ip-service     ClusterIP   10.152.183.138   <none>        5000/TCP   29h
service/redis-cluster-ip-service      ClusterIP   10.152.183.48    <none>        6379/TCP   7m12s
service/postgres-cluster-ip-service   ClusterIP   10.152.183.240   <none>        5432/TCP   51s

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/client-deployment     3/3     3            3           38h
deployment.apps/server-deployment     3/3     3            3           29h
deployment.apps/worker-deployment     1/1     1            1           29h
deployment.apps/redis-deployment      1/1     1            1           7m12s
deployment.apps/postgres-deployment   0/1     1            0           20s

NAME                                             DESIRED   CURRENT   READY   AGE
replicaset.apps/client-deployment-7cb6c958f7     3         3         3       38h
replicaset.apps/server-deployment-9bff8dfb       3         3         3       29h
replicaset.apps/worker-deployment-666c96ffc5     1         1         1       29h
replicaset.apps/redis-deployment-58c4799ccc      1         1         1       7m12s
replicaset.apps/postgres-deployment-6796b9c68d   1         1         0       20s


ali@stinky:~/git/sandbox/2020/docker-kubernetes-course/complex-219/k8s (main)$ kubectl logs pod/postgres-deployment-6796b9c68d-tfgh5
Error: Database is uninitialized and superuser password is not specified.
       You must specify POSTGRES_PASSWORD to a non-empty value for the
       superuser. For example, "-e POSTGRES_PASSWORD=password" on "docker run".

       You may also use "POSTGRES_HOST_AUTH_METHOD=trust" to allow all
       connections without a password. This is *not* recommended.

       See PostgreSQL documentation about "trust":
       https://www.postgresql.org/docs/current/auth-trust.html
```

Note `CrashLoopBackOff` and the logs, postgres latest needs a `POSTGRES_PASSWORD` env var now.
