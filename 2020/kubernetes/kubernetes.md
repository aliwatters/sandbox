# Notes on installing and using kubernetes for travelblog

## Locally

### Setup

`sudo snap install microk8s --classic`

Micro-kubernetes, microk8s. Installs a local version of kubernetes, can also be used in CI. Note will list a couple of steps for adding to a microk8s group via sudo, do this and login again.

As user:

Add an alias for `kubectl='microk8s kubectl'` in `.bash_aliases`, makes things easier.

Autocompletion: yes!

```
$ source <(kubectl completion bash) # one time!
$ echo "source <(kubectl completion bash)" >> ~/.bashrc # and on subsequent shells
```

### Commands

https://kubernetes.io/docs/reference/kubectl/cheatsheet/ -- very helpful!

`kubectl version` -- should show both client and server
`kubectl get nodes` -- shows the nodes, in microk8s this will be just the localhost
`kubectl create deployment kubernetes-bootcamp --image=gcr.io/google-samples/kubernetes-bootcamp:v1` -- gets and image from googles repository and adds to a deployment
`kubectl get deployments` -- shows the deployments, in this case `kubernetes-bootcamp`
`kubectl proxy` -- starts the proxy into the k8s network, won't respond but will show the network address the proxy has opened

### Proxy commands

`curl http://localhost:8001/version` -- gets the version, I think from the service running

Pods; "Pods are the smallest, most basic deployable objects in Kubernetes" - https://cloud.google.com/kubernetes-engine/docs/concepts/pod

`export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')` -- sets an env var with the pod name

### Troubleshooting commands

`kubectl get` - list resources
`kubectl describe` - show detailed information about a resource
`kubectl logs` - print the logs from a container in a pod
`kubectl exec` - execute a command on a container in a pod

examples:

```
kubectl get nodes
kubectl get pods
kubectl describe pods
kubectl logs kubernetes-bootcamp
```

Troubleshooting -- when trying to run the proxy after a restart, an error occured;

`curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME/proxy/`

> kubelet does not have ClusterDNS IP configured and cannot create Pod using "ClusterFirst" policy. > Falling back to "Default" policy

To fix this run `microk8s enable dns`

Next:

`curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME/proxy/`

```
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {

  },
  "status": "Failure",
  "message": "error trying to reach service: dial tcp 10.1.134.69:80: connect: connection refused",
  "code": 500
}
```

microk8s also needs a port specified; in this case the internal port is `8080`, running

```
$ curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME:8080/proxy/
Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-57978f5f5d-9rxqf | v=1
```

worked as in the tutorial.
curl 10.1.134.64:$NODE_PORT

### Minor updates

`kubectl exec $POD_NAME -- env` -- note exec has the -- before the command!
`kubectl exec -ti $POD_NAME -- bash` -- interactive terminal (just like docker), pretty much everything there.

### Exposing services

I can't figure out how to get the external IP from the cluster (microk8s commands are not the same as minikube), but the network is there in `ifconfig`.

```
kubectl get services
kubectl expose deployment/kubernetes-bootcamp --type="NodePort" --port 8080
kubectl describe services/kubernetes-bootcamp
export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
ifconfig # look for vxlan calico
curl 10.1.134.64:$NODE_PORT
```

Next up -- enabling local docker registry (important for the TB images I'm building).

```
WARNING:  Docker is installed.
File "/etc/docker/daemon.json" does not exist.
You should create it and add the following lines:
{
    "insecure-registries" : ["localhost:32000"]
}
and then restart docker with: sudo systemctl restart docker
```

Did that.

```
$ cat /etc/docker/daemon.json
{
    "insecure-registries" : ["localhost:32000"]
}
```

### Removing pods and deployments and nodes, oh my!

```
$ kubectl delete deployment kubernetes-bootcamp
deployment.apps "kubernetes-bootcamp" deleted
$ kubectl get pods
No resources found in default namespace.
```

### Troubleshooting a dev machine hairball

```
$ microk8s status
microk8s is not running. Use microk8s inspect for a deeper inspection.
$ microk8s inspect
[sudo] password for ali:
Inspecting Certificates
Inspecting services
  Service snap.microk8s.daemon-cluster-agent is running
  Service snap.microk8s.daemon-containerd is running
  Service snap.microk8s.daemon-apiserver is running
  Service snap.microk8s.daemon-apiserver-kicker is running
  Service snap.microk8s.daemon-control-plane-kicker is running
  Service snap.microk8s.daemon-proxy is running
  Service snap.microk8s.daemon-kubelet is running
  Service snap.microk8s.daemon-scheduler is running
  Service snap.microk8s.daemon-controller-manager is running
  Copy service arguments to the final report tarball
Inspecting AppArmor configuration
Gathering system information
  Copy processes list to the final report tarball
  Copy snap list to the final report tarball
  Copy VM name (or none) to the final report tarball
  Copy disk usage information to the final report tarball
  Copy memory usage information to the final report tarball
  Copy server uptime to the final report tarball
  Copy current linux distribution to the final report tarball
  Copy openSSL information to the final report tarball
  Copy network configuration to the final report tarball
Inspecting kubernetes cluster
  Inspect kubernetes cluster
Inspecting juju
  Inspect Juju
Inspecting kubeflow
  Inspect Kubeflow

Building the report tarball
  Report tarball is at /var/snap/microk8s/1856/inspection-report-20201217_073048.tar.gz

```

```
$ kubectl describe pod
Name:           kubernetes-bootcamp-57978f5f5d-knf22
Namespace:      default
Priority:       0
Node:           <none>
Labels:         app=kubernetes-bootcamp
                pod-template-hash=57978f5f5d
Annotations:    <none>
Status:         Pending
IP:
IPs:            <none>
Controlled By:  ReplicaSet/kubernetes-bootcamp-57978f5f5d
Containers:
  kubernetes-bootcamp:
    Image:        gcr.io/google-samples/kubernetes-bootcamp:v1
    Port:         <none>
    Host Port:    <none>
    Environment:  <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-fj967 (ro)
Conditions:
  Type           Status
  PodScheduled   False
Volumes:
  default-token-fj967:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-fj967
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type     Reason            Age                From               Message
  ----     ------            ----               ----               -------
  Warning  FailedScheduling  14m                default-scheduler  0/1 nodes are available: 1 node(s) were unschedulable.
  Warning  FailedScheduling  37m (x3 over 39m)  default-scheduler  0/1 nodes are available: 1 node(s) were unschedulable.
  Warning  FailedScheduling  15m (x3 over 18m)  default-scheduler  0/1 nodes are available: 1 node(s) were unschedulable.
```

Eventually tried rebooting the host (stinky), which didn't fix the issue.

Created: https://github.com/ubuntu/microk8s/issues/1830

Things looked weird, lots modules were disabled/clean -- so a reinstall of microk8s was suggested.

`snap remove microk8s --purge`

Went back to start of doc, reinstalled, ran commands and all was working.

### Module 5; Scaling replica sets

`$ kubectl scale deployments/kubernetes-bootcamp --replicas=4` -- scale up the replica-sets

```
$ kubectl get rs
NAME                             DESIRED   CURRENT   READY   AGE
kubernetes-bootcamp-57978f5f5d   4         4         4       41m
```

and pods

```
$ kubectl get pods -o wide
NAME                                   READY   STATUS    RESTARTS   AGE    IP            NODE     NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-57978f5f5d-tvpx5   1/1     Running   0          46m    10.1.134.66   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-rzfdt   1/1     Running   0          5m9s   10.1.134.73   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-v5v5v   1/1     Running   0          5m9s   10.1.134.71   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-6qf2s   1/1     Running   0          5m9s   10.1.134.72   stinky   <none>           <none>
```

Setup more env vars

```
export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
echo NODE_PORT=$NODE_PORT
```

Scale down the number of replicas

```
$ kubectl scale deployments/kubernetes-bootcamp --replicas=2
deployment.apps/kubernetes-bootcamp scaled

$ kubectl get deployments
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
kubernetes-bootcamp   2/2     2            2           63m


$ kubectl get pods -o wide
NAME                                   READY   STATUS        RESTARTS   AGE   IP            NODE     NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-57978f5f5d-tvpx5   1/1     Running       0          64m   10.1.134.66   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-v5v5v   1/1     Running       0          22m   10.1.134.71   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-6qf2s   0/1     Terminating   0          22m   10.1.134.72   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-rzfdt   0/1     Terminating   0          22m   10.1.134.73   stinky   <none>           <none>
```

### Module 6; updating

https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/

```
$ kubectl scale deployments/kubernetes-bootcamp --replicas=4
deployment.apps/kubernetes-bootcamp scaled
$ kubectl get pods -o wide
NAME                                   READY   STATUS    RESTARTS   AGE   IP            NODE     NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-57978f5f5d-tvpx5   1/1     Running   0          12h   10.1.134.66   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-v5v5v   1/1     Running   0          11h   10.1.134.71   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-bt4pq   1/1     Running   0          4s    10.1.134.74   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-5d8st   1/1     Running   0          4s    10.1.134.75   stinky   <none>           <none>
```

Now update the image to v2.

```
$ kubectl get pods -o wide
NAME                                   READY   STATUS              RESTARTS   AGE    IP            NODE     NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-57978f5f5d-tvpx5   1/1     Running             0          12h    10.1.134.66   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-v5v5v   1/1     Running             0          11h    10.1.134.71   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-5d8st   1/1     Running             0          100s   10.1.134.75   stinky   <none>           <none>
kubernetes-bootcamp-57978f5f5d-bt4pq   1/1     Terminating         0          100s   10.1.134.74   stinky   <none>           <none>
kubernetes-bootcamp-769746fd4-zh5gq    0/1     ContainerCreating   0          3s     <none>        stinky   <none>           <none>
kubernetes-bootcamp-769746fd4-nrbvt    0/1     ContainerCreating   0          3s     <none>        stinky   <none>           <none>
```

A few minutes later the rolling update has completed.

```
$ kubectl get pods -o wide
NAME                                  READY   STATUS    RESTARTS   AGE   IP            NODE     NOMINATED NODE   READINESS GATES
kubernetes-bootcamp-769746fd4-zh5gq   1/1     Running   0          13m   10.1.134.76   stinky   <none>           <none>
kubernetes-bootcamp-769746fd4-nrbvt   1/1     Running   0          13m   10.1.134.77   stinky   <none>           <none>
kubernetes-bootcamp-769746fd4-r6s4g   1/1     Running   0          13m   10.1.134.78   stinky   <none>           <none>
kubernetes-bootcamp-769746fd4-qk5t4   1/1     Running   0          13m   10.1.134.79   stinky   <none>           <none>
```

it can be verified with

```
$ kubectl rollout status deployments/kubernetes-bootcamp
deployment "kubernetes-bootcamp" successfully rolled out
```

Now to rollback a rollout

```
$ kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=gcr.io/google-samples/kubernetes-bootcamp:v10
deployment.apps/kubernetes-bootcamp image updated
```

v10 isn't a valid image, so it fails.

```
$ kubectl get pods
NAME                                  READY   STATUS             RESTARTS   AGE
kubernetes-bootcamp-769746fd4-zh5gq   1/1     Running            0          23m
kubernetes-bootcamp-769746fd4-nrbvt   1/1     Running            0          23m
kubernetes-bootcamp-769746fd4-qk5t4   1/1     Running            0          22m
kubernetes-bootcamp-597654dbd-crgsw   0/1     ImagePullBackOff   0          3m32s
kubernetes-bootcamp-597654dbd-nmf2b   0/1     ErrImagePull       0          3m32s
```

Rollback with

```
$ kubectl rollout undo deployments/kubernetes-bootcamp
deployment.apps/kubernetes-bootcamp rolled back
```

After this the previous image `v2` is used.

That's the end o the tutorial. Didn't cover config files though.

### Kubernetes config files

You can find the running kube's config with a command.

```
$ kubectl config view --minify
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://127.0.0.1:16443
  name: microk8s-cluster
contexts:
- context:
    cluster: microk8s-cluster
    user: admin
  name: microk8s
current-context: microk8s
kind: Config
preferences: {}
users:
- name: admin
  user:
    token: REDACTED
```

or look at the source file

```
$ more .kube/config
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiB...full cert...FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
    server: https://127.0.0.1:16443
  name: microk8s-cluster
contexts:
- context:
    cluster: microk8s-cluster
    user: admin
  name: microk8s
current-context: microk8s
kind: Config
preferences: {}
users:
- name: admin
  user:
    token: OFA...full token...az0K
```

## Kompose

`sudo snap install kompose` -- install kompose

```
$ kompose convert -f ~/git/travelblog/docker-compose.yml
WARN Volume mount on the host "/home/ali/git/travelblog/legacy" isn't supported - ignoring path on the host
WARN Volume mount on the host "/home/ali/git/travelblog/legacy" isn't supported - ignoring path on the host
WARN Volume mount on the host "/home/ali/git/travelblog/nginx/site.conf" isn't supported - ignoring path on the host
WARN Volume mount on the host "/home/ali/git/travelblog/nginx/ssl" isn't supported - ignoring path on the host
INFO Kubernetes file "php-service.yaml" created
INFO Kubernetes file "web-service.yaml" created
INFO Kubernetes file "php-deployment.yaml" created
INFO Kubernetes file "php-claim0-persistentvolumeclaim.yaml" created
INFO Kubernetes file "web-deployment.yaml" created
INFO Kubernetes file "web-claim0-persistentvolumeclaim.yaml" created
INFO Kubernetes file "web-claim1-persistentvolumeclaim.yaml" created
INFO Kubernetes file "web-claim2-persistentvolumeclaim.yaml" created
```

So first thing to address is that the code ran in my docker-compose file is on a volume mount, which isn't a thing in k8s. We need all the code to be in the image (of course).

The output files don't work with kubctl.

```
$ kubectl apply -f *.yaml
error: Unexpected args: [php-deployment.yaml php-service.yaml web-claim0-persistentvolumeclaim.yaml web-claim1-persistentvolumeclaim.yaml web-claim2-persistentvolumeclaim.yaml web-deployment.yaml web-service.yaml]
See 'kubectl apply -h' for help and examples
```

More work to do!
