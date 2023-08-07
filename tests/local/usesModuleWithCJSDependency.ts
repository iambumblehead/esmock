#!/usr/bin/env ts-node-esm
import meow from 'meow'

const cli = meow('foo', { importMeta: import.meta })

export default () => console.log(cli.help)
