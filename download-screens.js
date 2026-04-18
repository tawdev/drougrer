const fs = require('fs');
const https = require('https');

const screens = [
  { name: 'blog-listing', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2UyMTgyODE4MWY4ZTQ0MjQ5MDAzYzVkMzQ5MGNhN2Q5EgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'about-us', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NkNDNjMGRmN2Q2OTQ2YzdhYzExYjMyODQ1MzQ0NDgzEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'order-confirmation', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JjYzhhOWZlNTU1YzRmZDVhZTBiMTAzNTY4YTU0MDQyEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'product-listing', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JjZTU4MWE0NmYxNTQyMjBiNjY5MTJhOThjM2NjYjgwEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'admin-orders', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzVlYjA1ZWUwZTRlMjRjODBhYjk0ZDkxZTMwMzk3OWIzEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'product-details', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MyZDNjYmE0NDhjMTRlMjliMTdmZWNlOTU3YTYwZDBjEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'contact', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg1ZmJkOTJiNTQwNTQ3ZDNhMmJkMDk5MDQ4Y2I2NDAxEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'home', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2UxNTliY2RiNWUwYzQ4NGQ5Y2QwNjA3MzIyNWYxOGQ4EgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'blog-article', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Q5ZGU0YjNjMjM5YzRmMDViNzUyZWI0NDczMTljYmMyEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'checkout', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU5YmJmNDUzMTRiNzQ0NmZhMTUxYWQzYTg0YjM5ODYxEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'shopping-cart', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzBiZjEyMmQ4YmM5YjQ4Yzc5ZDljYTBjYjJjODZlZGIxEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'admin-dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FhZWU5ZTdiYjNlMDQ2NWNhMmRhYWI0NjgxOThmZGY0EgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' },
  { name: 'admin-products', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE5MjFlNDA0ODhiNzQ5MDhiNWQ4ZjgzOGEzZGFmNjQyEgsSBxCg09KC5B8YAZIBIwoKcHJvamVjdF9pZBIVQhM0OTQyOTM2ODIyNTEyMjgyOTA2&filename=&opi=89354086' }
];

if (!fs.existsSync('./screens')) {
  fs.mkdirSync('./screens');
}

const downloadFile = (url, path) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(path);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        https.get(res.headers.location, (redirectRes) => {
          const file = fs.createWriteStream(path);
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        reject(new Error(`Failed with status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

(async () => {
  for (const screen of screens) {
    console.log(`Downloading ${screen.name}.html...`);
    try {
      await downloadFile(screen.url, `./screens/${screen.name}.html`);
      console.log(`Success: ${screen.name}.html`);
    } catch (e) {
      console.error(`Error downloading ${screen.name}:`, e);
    }
  }
})();
