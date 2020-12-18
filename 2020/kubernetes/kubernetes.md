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
