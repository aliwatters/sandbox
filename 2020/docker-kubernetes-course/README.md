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

## Section 8 - Multi-container app

Building an over the top fibonacci system. Note: pretty much a JS section, skippable as no docker or kubernetes content. I'm going to do it... might be a completionist.

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
