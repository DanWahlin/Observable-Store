import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Routes, { history } from './Routes';
import * as serviceWorker from './serviceWorker';
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

const production = process.env.NODE_ENV === 'production';

ObservableStore.globalSettings = { isProduction: production };
if (!production) {
  ObservableStore.addExtension(new ReduxDevToolsExtension({ reactRouterHistory: history }));
}

ReactDOM.render(<Routes />, document.getElementById('root'));

serviceWorker.unregister();
