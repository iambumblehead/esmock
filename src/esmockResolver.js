import resolvewithplus from 'resolvewithplus'
import pnpResolver from './pnpResolver.js'

export default async opts => opts.resolver || pnpResolver || resolvewithplus
