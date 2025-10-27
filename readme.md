## Local development

A certificate is required for your browser to trust the services so use the mkcert tool to create them. The installation instructions can be found from the [mkcert page](https://github.com/FiloSottile/mkcert).

Once it is installed, setup local certificate authority with:

```
mkcert -install
```

Then create certificates for the required services:

```
mkcert "*.localhost" traefik.localhost app.localhost backend.localhost postgres.localhost auth.localhost processor.localhost localhost 127.0.0.1 ::1
```

Move the certificate and key to the correct place:

```
cd traefik/
mkdir certs
cd ../
mv _wildcard.localhost+9.pem traefik/certs/cert.pem
mv _wildcard.localhost+9-key.pem traefik/certs/key.pem
```

Create .env file in the root directory, adding following variables
```
# .env

# TODO
```
Build images
```
./build-docker-images.sh
```

Start using docker-compose

```
docker-compose up
```
