# ledroom

## Start all services

(Make sure you running docker-desktop and you copied and renamed .sample.development.env to .development.env inside env folder)

```console
$ docker-compose --env-file ./env/.development.env up
```

## Start one specific service

(You can find service names inside docker-compose.yml)

```console
$ docker-compose --env-file ./env/.development.env up [service name]
```

## If you added a new package to frontend or backend

You can do that from the Docker Desktop, but it easier to add a few new flag to the compose command.

```console
$ docker-compose --env-file ./env/.development.env up [service name] --build --force-recreate
```

## If you noticed any problems something like storage is not enough etc

(You can flush all the docker images, volumes, cached stuff)

```
docker system prune --all
```
