[![GPL-3.0 License][license-shield]][license-url] [![Docker Pulls][docker-shield]][docker-url] 

<br />
<p align="center">
  <a href="https://github.com/ottomated/crewlink-server">
    <img src="logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">CrewLink Server</h3>

  <p align="center">
    Voice Relay server for <a href="https://github.com/ottomated/crewlink">CrewLink</a>.
    <br />
    <a href="https://github.com/ottomated/crewlink-server/issues">Report Bug</a>
    ·
    <a href="https://github.com/ottomated/crewlink-server/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Docker Quickstart](#docker-quickstart)
  * [Building the Docker Image](#building-the-docker-image)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Contributing](#contributing)
* [License](#license)



<!-- ABOUT THE PROJECT -->
## About The Project

This is the relay server for CrewLink, an Among Us proximity voice chat program. I am currently hosting a server at `https://crewl.ink/`, but if you want a more reliable option I would suggest to deploy this repository yourself.

## Environment Variables

Optional environment variables:

 - `PORT`: Specifies the port that the server runs on. Defaults to `443` if `HTTPS` is enabled, and `9736` if not.
 - `ADDRESS` **(REQUIRED)**: Specifies the server domain
 - `NAME`: Specifies the server name
 - `HTTPS`: Enables https. You must place `privkey.pem` and `fullchain.pem` in your CWD.
 - `SSLPATH`: Specifies an alternate path to SSL certificates.

## Deploy to Heroku

To get up and running quickly, you can deploy to Heroku using the button below

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

This will deploy an instance of the crewlink-server. You can get the URL of your server by using the app name that you gave when you launched the app on heroku and appending `.herokuapp.com`. You can also find the URL of your server by going to "Settings", scrolling down to "Domains", and removing the `https://` and trailing slash from the url. Using this URL, follow step 4 of the [installation instructions](https://github.com/ottomated/CrewLink-server#manual-installation) to connect your client to your server instance.

## Docker Quickstart

Run the server with [Docker](https://docs.docker.com/get-docker/) by running the following command:

```
docker run -d -p 9736:9736 ottomated/crewlink-server:latest
```

To change the external port the server uses, change the *first* instance of the port. For example, to use port 8123:

```
docker run -d -p 8123:9736 ottomated/crewlink-server:latest
```

### Building the Docker Image

To build your own Docker image, do the following:

1. Clone the repo
```sh
git clone https://github.com/ottomated/crewlink-server.git
cd crewlink-server
```

2. Run the Docker build command:
```sh
docker build -t ottomated/crewlink-server:build .
```

## Manual Installation

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* [node.js](https://nodejs.org/en/download/)
* yarn
```sh
npm install yarn -g
```

### Installation

1. Clone the repo
```sh
git clone https://github.com/ottomated/crewlink-server.git
cd crewlink-server
```
2. Install NPM packages
```sh
yarn install
```
3. Compile and run the project
```JS
yarn start
```
4. Copy your server's IP and port into CrewLink settings. Make sure everyone in your lobby is using the same server.

<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.


[license-shield]: https://img.shields.io/github/license/ottomated/crewlink.svg?style=flat-square
[license-url]: https://github.com/ottomated/crewlink-server/blob/master/LICENSE
[docker-shield]: https://img.shields.io/docker/pulls/ottomated/crewlink-server
[docker-url]: https://hub.docker.com/repository/docker/ottomated/crewlink-server
