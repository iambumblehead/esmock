export default (cache => async () => typeof cache === 'boolean' ? cache
  : cache = ((await import(`${import.meta.url}?test`)).default === true))()
