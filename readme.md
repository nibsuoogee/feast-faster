## Development

Name branches feature-N or fix-N based on the issue number N. For example:

```
feature-1
```

## Git version control help

View branches

```
git branch -a
```

Check the status of your branch

```
git status
```

Get new branches from the remote (and prune removed ones)

```
git fetch origin --prune
```

Pull changes to your current branch

```
git pull
```

Make a commit to your local branch

```
git add .
git commit -m "Your commit message"
```

Push your local commits to the remote

```
git push
// Use the following if git push complains about the remote:
git push origin -u branch_name
```

Delete your local changes (use with care!)

```
git stash
```

Copy (rebase) the new commits from the main branch and push them to your branch

```
git rebase main
git push origin branch_name --force-with-lease
```

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

Create .env.local file in the root directory, adding following variables.
`OPEN_ROUTE_SERVICE_API_KEY` is an API key received from [Open Route Service](https://openrouteservice.org/).
To get an API key, sign up https://openrouteservice.org/dev/#/signup
```
# .env.local

OPEN_ROUTE_SERVICE_API_KEY=''
```

Build images

```
./build-docker-images.sh
```

Start using docker-compose

```
docker-compose up
```
