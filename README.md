# anvilkernel.com

Standalone Anvil project site. The site is not deployed until the ICP filing
for `anvilkernel.com` is approved.

## Build

```sh
npm install
PUBLIC_ICP='苏ICP备XXXXXXXXXX号' npm run build
```

`PUBLIC_ICP` is optional at build time. When it is empty, the footer omits the
filing link; set it to the exact number issued for this domain before enabling
the vhost.

Output is `dist/`. Deploy with:

```sh
rsync -az --delete --exclude=.well-known/ dist/ aliyun:/var/www/anvilkernel.com/
ssh aliyun 'chown -R deployer:deployer /var/www/anvilkernel.com'
```

## Server

`deploy/nginx/anvilkernel.conf` is the source of truth for the vhost. It is not
enabled. Keep it out of `sites-enabled/` until:

1. ICP filing is approved.
2. `anvilkernel.com` and `www.anvilkernel.com` resolve to the ECS.
3. Certbot has issued `/etc/letsencrypt/live/anvilkernel.com/`.

Certificate bootstrap:

```sh
certbot certonly --webroot -w /var/www/anvilkernel.com \
  -d anvilkernel.com -d www.anvilkernel.com
```

Then:

```sh
ln -s /etc/nginx/sites-available/anvilkernel.conf \
      /etc/nginx/sites-enabled/anvilkernel.conf
nginx -t && systemctl reload nginx
```
