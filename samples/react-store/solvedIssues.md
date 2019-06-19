## Types error for Node when running `npm start`

When doing the observable store build ensure that all .d.ts files copied into the react project are deleted. Otherwise it makes a .tsconfig file
and types for Node and other items are missing which causes the error.

## Browserlist Error: BrowserslistError: Unknown browser query `android all`

https://github.com/facebook/create-react-app/issues/7239