# CryptoFS
A secure, cryptographic file upload system POC. It uses digital signature as a form of user authentication, and uses file content hashing to reduce duplication of files. All content stored is encrypted, except for the files themselves.
Public-private key pairs are generated based on browser access.

## Steps to run

- Create a `.env` file like the `.env.example` file

- Run `npm start`

## Future steps
- Split file into parts and encrypt into multiple storage buckets
- Add a proper user authentication front
- Add checks for file sizes