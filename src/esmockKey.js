const esmockKeyEncode = value => String(value)
  .replace(/[^ !'()~*]/gu, encodeURIComponent)
  .replace(/ /g, '+')
  .replace(/[!'()~*]/g, ch => (
    `%${ch.charCodeAt().toString(16).slice(-2).toUpperCase()}`));

const esmockKeyDecode = str => decodeURIComponent(str.replace(/\+/g, ' '));

export {
  esmockKeyEncode,
  esmockKeyDecode
}
