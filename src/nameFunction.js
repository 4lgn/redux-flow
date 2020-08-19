export default function nameFunction(name, body) {
  return {
    [name](...args) {
      return body(...args)
    },
  }[name]
}
