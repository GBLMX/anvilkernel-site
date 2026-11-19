# anvilkernel.com

Standalone Anvil project site. Deployed at <https://anvilkernel.com/> with ICP
filing `苏ICP备2026079470号-2`. DNS, TLS, and the nginx vhost were enabled on
2026-11-20.

## Routes

| Route | Purpose |
|---|---|
| `/` | Project overview, architecture, status, and install CTA |
| `/install/` | Source build, release layout, verification, runtime boundaries, uninstall |
| `/docs/` | Documentation entry; links to the repository as the source of truth |
| `/releases/` | Current baseline, Unreleased, availability, breaking changes, known limits |
| `/plugins/` | Local install, marketplace status, and trust model |
| `/404.html` | Static not-found page; served internally by nginx |

`src/data/site.ts` is the single source for the version label, navigation, and
release summary. Do not duplicate those values in page markup.

## Checks

`npm run build` runs `astro build` and then `scripts/check-site.mjs`. The check
requires the generated routes and verifies internal links, skip links, JSON-LD,
`og:image:alt`, `robots.txt`, sitemap entries, and the 404 `noindex` marker.

```sh
npm run build
npm run check
```

## Build

```sh
npm install
PUBLIC_ICP='苏ICP备2026079470号-2' npm run build
```

`PUBLIC_ICP` is optional for a local build. When it is empty, the footer omits
the filing link. A local `.env` or
`PUBLIC_ICP='苏ICP备2026079470号-2' npm run build` supplies the filing number.
The GitHub deploy workflow requires the same value in the `PUBLIC_ICP`
repository secret and refuses to deploy without it.

Output is `dist/`. Pushing to `main` runs
`.github/workflows/build.yml`. Required repository secrets are
`PUBLIC_ICP`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST`, and
`DEPLOY_USER`.

Manual deploy:

```sh
rsync -az --delete --exclude=.well-known/ dist/ aliyun:/var/www/anvilkernel.com/
ssh aliyun 'chown -R deployer:deployer /var/www/anvilkernel.com'
scp deploy/nginx/anvilkernel.conf aliyun:/tmp/anvilkernel.conf
ssh aliyun 'install -m 644 /tmp/anvilkernel.conf /etc/nginx/sites-available/anvilkernel.conf && nginx -t && systemctl reload nginx'
curl -sS -o /dev/null -w '%{http_code}\n' https://anvilkernel.com/missing
```

## Server

`deploy/nginx/anvilkernel.conf` is the source of truth for the vhost. It is
enabled in production. The certificate was issued on 2026-11-20 and expires on
2027-02-17; Certbot's timer renews it.

Deployment prerequisites completed:

1. ICP filing is approved (`苏ICP备2026079470号-2`).
2. `anvilkernel.com` and `www.anvilkernel.com` resolve to the ECS.
3. Certbot issued `/etc/letsencrypt/live/anvilkernel.com/`.

Certificate bootstrap:

```sh
certbot certonly --webroot -w /var/www/anvilkernel.com \
  -d anvilkernel.com -d www.anvilkernel.com
```

Before enabling, validate both vhosts together with stub certificates:

```sh
nginx -t -c /tmp/nginx-combined.conf
```

The combined `bionickernel.conf` (`quic reuseport`) and
`anvilkernel.conf` (`quic`) configuration passes this test. Then:

```sh
ln -s /etc/nginx/sites-available/anvilkernel.conf \
      /etc/nginx/sites-enabled/anvilkernel.conf
nginx -t && systemctl reload nginx
```
