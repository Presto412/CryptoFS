# CryptoFS

http://cryptofs.herokuapp.com

A secure, cryptographic file upload system POC. It uses digital signature as a form of user authentication, and uses file content hashing to reduce duplication of files. All content stored is encrypted, except for the files themselves.
Public-private key pairs are generated based on browser access.

## Requirements

- Node.js + NPM
- MongoDB

```sh
❯ node -v
v12.16.3
❯ npm -v
6.14.4
❯ mongo --version
MongoDB shell version v4.2.7
git version: 51d9fe12b5d19720e72dcd7db0f2f17dd9a19212
allocator: system
modules: none
build environment:
    distarch: x86_64
    target_arch: x86_64

```

## Steps to run

### With docker
- Create a `.env` file like the `.env.example` file
- Run `docker-compose up`


### Without docker
- Create a `.env` file like the `.env.example` file
- Run `npm install`
- Run `npm start`
