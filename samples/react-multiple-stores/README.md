# React Core Concepts

This project demonstrates core concepts of React development. The Angular version of the application can be found at https://github.com/danwahlin/angular-core-concepts.

The project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). You can find additional information on how to perform common tasks [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

Special thanks to [Damon Bauer](https://github.com/damonbauer) for the initial conversion of my Angular project to React!

## Running the Project

1. Install Node.js (https://nodejs.org)

1. Install Yarn

    Mac:      https://yarnpkg.com/en/docs/install#mac-tab

    Windows:  https://yarnpkg.com/en/docs/install#windows-tab

1. Install the application dependencies:

    `yarn`

1. Run the application:

    `npm start`
    

## Running the Project with Docker

1. Install the app dependencies (see above) and Docker Community Edition (if you're on Windows 7/8 you'll install Docker Toolbox) - https://docker.com

1. Run `npm run build`

1. Run `docker run -d -p 8080:80 -v $(pwd)/build:/usr/share/nginx/html nginx:alpine`

1. Visit `http://localhost:8080` in your browser


## Building Custom React/Docker Images

1. Examples of development and production Dockerfiles are available at the root of the project.

