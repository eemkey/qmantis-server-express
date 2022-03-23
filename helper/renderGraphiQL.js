/*


// Ensures string values are safe to be used within a <script> tag.
function safeSerialize(data) {
  return data != null
    ? JSON.stringify(data).replace(/\//g, '\\/')
    : 'undefined';
}

// Implemented as Babel transformation, see ../resources/load-statically-from-npm.js
function loadFileStaticallyFromNPM(npmPath) {}


const fs = require('fs');

const ts = require('typescript');

/**
 * Transforms:
 *
 *  loadFileStaticallyFromNPM(<npm path>)
 *
 * to:
 *
 *  "<file content>"
 
module.exports.transformLoadFileStaticallyFromNPM = function (context) {
  return function visit(node) {
    if (ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'loadFileStaticallyFromNPM'
      ) {
        const npmPath = node.arguments[0].text;
        const filePath = require.resolve(npmPath);
        const content = fs.readFileSync(filePath, 'utf-8');
        return ts.createStringLiteral(content);
      }
    }
    return ts.visitEachChild(node, visit, context);
  };
};


*/

/**
 * When express-graphql receives a request which does not Accept JSON, but does
 * Accept HTML, it may present GraphiQL, the in-browser GraphQL explorer IDE.
 *
 * When shown, it will be pre-populated with the result of having executed the
 * requested query.
 
export function renderGraphiQL(data, options) {
  const queryString = data.query;
  const variablesString =
    data.variables != null ? JSON.stringify(data.variables, null, 2) : null;
  const resultString =
    data.result != null ? JSON.stringify(data.result, null, 2) : null;
  const operationName = data.operationName;
  const defaultQuery = options?.defaultQuery;
  const headerEditorEnabled = options?.headerEditorEnabled;
  const shouldPersistHeaders = options?.shouldPersistHeaders;
  const subscriptionEndpoint = options?.subscriptionEndpoint;
  const websocketClient = options?.websocketClient ?? 'v0';

  let subscriptionScripts = '';
  if (subscriptionEndpoint != null) {
    if (websocketClient === 'v1') {
      subscriptionScripts = `
      <script>
        ${loadFileStaticallyFromNPM('graphql-ws/umd/graphql-ws.js')}
      </script>
      <script>
      ${loadFileStaticallyFromNPM(
        'subscriptions-transport-ws/browser/client.js',
      )}
      </script>
      `;
    } else {
      subscriptionScripts = `
      <script>
        ${loadFileStaticallyFromNPM(
          'subscriptions-transport-ws/browser/client.js',
        )}
      </script>
      <script>
        ${loadFileStaticallyFromNPM(
          'subscriptions-transport-ws/browser/client.js',
        )}
      </script>
      <script>
        ${loadFileStaticallyFromNPM(
          'graphiql-subscriptions-fetcher/browser/client.js',
        )}
      </script>
      `;
    }
  }

  return `<!--
The request to this GraphQL server provided the header "Accept: text/html"
and as a result has been presented GraphiQL - an in-browser IDE for
exploring GraphQL.

If you wish to receive JSON, provide the header "Accept: application/json" or
add "&raw" to the end of the URL within a browser.
-->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GraphiQL</title>
  <meta name="robots" content="noindex" />
  <meta name="referrer" content="origin" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      overflow: hidden;
    }
    #graphiql {
      height: 100vh;
    }
  </style>
  <style>
    /* graphiql/graphiql.css 
    ${loadFileStaticallyFromNPM('graphiql/graphiql.css')}
  </style>
  <script>
    // promise-polyfill/dist/polyfill.min.js
    ${loadFileStaticallyFromNPM('promise-polyfill/dist/polyfill.min.js')}
  </script>
  <script>
    // unfetch/dist/unfetch.umd.js
    ${loadFileStaticallyFromNPM('unfetch/dist/unfetch.umd.js')}
  </script>
  <script>
    // react/umd/react.production.min.js
    ${loadFileStaticallyFromNPM('react/umd/react.production.min.js')}
  </script>
  <script>
    // react-dom/umd/react-dom.production.min.js
    ${loadFileStaticallyFromNPM('react-dom/umd/react-dom.production.min.js')}
  </script>
  <script>
    // graphiql/graphiql.min.js
    ${loadFileStaticallyFromNPM('graphiql/graphiql.min.js')}
  </script>
  ${subscriptionScripts}
</head>
<body>
  <div id="graphiql">Loading...</div>
  <script>
    // Collect the URL parameters
    var parameters = {};
    window.location.search.substr(1).split('&').forEach(function (entry) {
      var eq = entry.indexOf('=');
      if (eq >= 0) {
        parameters[decodeURIComponent(entry.slice(0, eq))] =
          decodeURIComponent(entry.slice(eq + 1));
      }
    });

    // Produce a Location query string from a parameter object.
    function locationQuery(params) {
      return '?' + Object.keys(params).filter(function (key) {
        return Boolean(params[key]);
      }).map(function (key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(params[key]);
      }).join('&');
    }

    // Derive a fetch URL from the current URL, sans the GraphQL parameters.
    var graphqlParamNames = {
      query: true,
      variables: true,
      operationName: true
    };

    var otherParams = {};
    for (var k in parameters) {
      if (parameters.hasOwnProperty(k) && graphqlParamNames[k] !== true) {
        otherParams[k] = parameters[k];
      }
    }
    var fetchURL = locationQuery(otherParams);

    // Defines a GraphQL fetcher using the fetch API.
    function graphQLFetcher(graphQLParams, opts) {
      return fetch(fetchURL, {
        method: 'post',
        headers: Object.assign(
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          opts && opts.headers,
        ),
        body: JSON.stringify(graphQLParams),
        credentials: 'include',
      }).then(function (response) {
        return response.json();
      });
    }

    function makeFetcher() {
      if('${typeof subscriptionEndpoint}' == 'string') {
        let client = null;
        let url = window.location.href;
        if('${typeof websocketClient}' == 'string' && '${websocketClient}' === 'v1') {
          client = window.graphqlWs.createClient({url: ${safeSerialize(
            subscriptionEndpoint,
          )} });
          return window.GraphiQL.createFetcher({url, wsClient: client});
        } else {
          let clientClass = window.SubscriptionsTransportWs.SubscriptionClient;
          client = new clientClass(${safeSerialize(subscriptionEndpoint)}, {
            reconnect: true
          });
          return window.GraphiQL.createFetcher({url, legacyClient: client});
        }
      }else{
        return graphQLFetcher;
      }
    }

    // When the query and variables string is edited, update the URL bar so
    // that it can be easily shared.
    function onEditQuery(newQuery) {
      parameters.query = newQuery;
      updateURL();
    }

    function onEditVariables(newVariables) {
      parameters.variables = newVariables;
      updateURL();
    }

    function onEditOperationName(newOperationName) {
      parameters.operationName = newOperationName;
      updateURL();
    }

    function updateURL() {
      history.replaceState(null, null, locationQuery(parameters));
    }

    // Render <GraphiQL /> into the body.
    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher:  makeFetcher(),
        onEditQuery: onEditQuery,
        onEditVariables: onEditVariables,
        onEditOperationName: onEditOperationName,
        query: ${safeSerialize(queryString)},
        response: ${safeSerialize(resultString)},
        variables: ${safeSerialize(variablesString)},
        operationName: ${safeSerialize(operationName)},
        defaultQuery: ${safeSerialize(defaultQuery)},
        headerEditorEnabled: ${safeSerialize(headerEditorEnabled)},
        shouldPersistHeaders: ${safeSerialize(shouldPersistHeaders)}
      }),
      document.getElementById('graphiql')
    );
  </script>
</body>
</html>`;
}

*/

export function renderGraphiQL(data, options) {
  return;
}
