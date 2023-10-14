import resolvewithplus from 'resolvewithplus'

const pnpResolver = process.versions.pnp && (await import('./pnpResolver.js')).default;

export default async opts => opts.resolver || pnpResolver || resolvewithplus
