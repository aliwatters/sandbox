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
