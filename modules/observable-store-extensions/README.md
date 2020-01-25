## Observable Store Extensions

[Observable Store](https://github.com/DanWahlin/Observable-Store) is a front-end state management library that provides a simple yet powerful way to manage state in front-end applications. 

This package can be used to integrate Observable Store with the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd). View more details about using the extensions [here](https://github.com/DanWahlin/Observable-Store#extensions).

### Changes

#### 2.2.6 - January 25, 2020

Change how detection for presence of redux devtools is done. Don't send state back to devtools while using time travel or jumping to a specific action (debugging scenarios).