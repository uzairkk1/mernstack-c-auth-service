import fs from 'fs'
import rsaPemToJwk from 'rsa-pem-to-jwk'

// const privateKey = fs.readFileSync('./certs/private.pem')
const publicKey = fs.readFileSync('./certs/public.pem')

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const jwk = rsaPemToJwk(publicKey, { use: 'sig' }, 'public')
// const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public')

console.log(JSON.stringify(jwk))
