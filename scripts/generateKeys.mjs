import crypto from 'crypto'
import fs from 'fs'

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
})

console.log('Private', privateKey)
console.log('Public', publicKey)
fs.writeFileSync(`${import.meta.dirname}/../certs/private.pem`, privateKey)
fs.writeFileSync(`${import.meta.dirname}/../certs/public.pem`, publicKey)
