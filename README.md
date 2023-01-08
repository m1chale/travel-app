# Template Project

## Usage

To use the template do the following steps:

1. Copy the project folder
2. Rename to your desired project-name
3. Delete the .git folder
4. Run: "git init"

After running these steps you will have a fresh git repository without any history of the template.

## Project description

The Project consits of a single web page for entering data which can be fetch to and from a local express server.

## Installation

    npm install

## Configuration

You need to have nodejs installad.

If you want to use the documentation, then you need to install JSdoc.

## Dependencies

- Routehandling: express
- Cross-Origin Resource Sharing: cors
- Middleware: body-parser
- Validation: joi
- Dev-Server: nodemon

## Structure

- config: All configuration files
- docs: Documentation
- src/website: Website code
- src/server: Server code

## Documenation

The documentation is built with JsDoc, see in:

    /docs/index.html

You can create the documentation by running the following command in the terminal.

    npm run docu

Thanks for reading
Michael
