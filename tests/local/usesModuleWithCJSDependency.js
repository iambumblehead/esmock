import meow from 'meow'

const cli = meow('foo', { importMeta: import.meta, description: false })

console.log(cli.help)
