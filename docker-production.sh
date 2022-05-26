docker-compose -f ./docker-compose-production.yml --env-file ./env/.env.production up db --build --force-recreate --detach 
sleep 30
docker-compose -f ./docker-compose-production.yml --env-file ./env/.env.production up auth --build --force-recreate --detach
sleep 10
docker-compose -f ./docker-compose-production.yml --env-file ./env/.env.production up backend --build --force-recreate --detach
sleep 10
docker-compose -f ./docker-compose-production.yml --env-file ./env/.env.production up frontend --build --force-recreate --detach