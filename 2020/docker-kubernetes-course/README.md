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
