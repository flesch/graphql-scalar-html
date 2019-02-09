# GraphQL HTML Scalar Type

A GraphQL **scalar** type that will sanitize an HTML string using [sanitize-html](http://npm.im/sanitize-html).

<div align="center">
  <img src="https://user-images.githubusercontent.com/13259/49333092-77d60800-f57e-11e8-9611-ef37f00e8ed5.png" alt="graphql-scalar-html" />
</div>

## Why Use This?

You may not actually need the `GraphQLHTML` scalar! Ideally, you'll have already taken steps to prevent malicious HTML from making it to a database. If you can trust that any HTML content your GraphQL server is sending to the client is safe, you can simply use the `String` scalar.

However, here are some examples of when you'll want to use a custom `HTML` scalar over `String`:

- You're consuming user supplied HTML content from a 3rd-party and you can't trust it's safe.
- User supplied content has been previously sanitized and considered "safe", but you need to remove certain HTML elements.
- You need to modify any HTML content in any way supported by [sanitize-html](http://npm.im/sanitize-html) across several resolvers.

## Install

<div>
  <pre>$ npm install --save <a href="https://www.npmjs.com/package/graphql">graphql</a> <a href="https://www.npmjs.com/package/graphql-scalar-html">graphql-scalar-html</a></pre>
</div>

> <img alt="GitHub" src="https://1bc3axd7ci.execute-api.us-east-1.amazonaws.com/v1/?text=NOTE&size=3em&color=6a737d&fill=dfe2e5&weight=bold" width="50" height="28" align="center" /> If not already installed in your project, make sure to install `graphql` — it's a peer dependency of this project.

## Getting Started

Let's assume we already have a simple [Apollo GraphQL server](https://www.apollographql.com/docs/apollo-server/) set up, with a root `comments` query that responds with an array of user supplied comments.

```javascript
import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    comments: [Comment]
  }

  type Comment {
    id: ID!
    body: String
  }
`;

const resolvers = {
  Query: {
    comments: async (parent, args, context, info) => {
      return Promise.resolve([
        { id: 1, body: `Hello, <script>console.log('👻')</script> world!` },
      ]);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

The `Comment` type includes a `body` field containing the user supplied HTML content. If we haven't taken other steps to prevent malicious HTML from being saved to our database, we can sanitize the response with the `HTML` scalar.

Let's add `graphql-scalar-html` to our code, changing `body` from a `String` to the new `HTML` scalar type, and adding the custom `HTML` scalar to our schema:

```diff
  import { ApolloServer, gql } from 'apollo-server';
+ import GraphQLHTML from 'graphql-scalar-html';
+ // const GraphQLHTML = require('graphql-scalar-html');

  const typeDefs = gql`
    type Query {
      comments: [Comment]
    }

    type Comment {
      id: ID!
-     body: String
+     body: HTML
    }

+   scalar HTML
  `;
```

We also need to define the `HTML` scalar as a new `GraphQLHTML` instance in our resolvers (see Apollo's ["Custom Scalars"](https://www.apollographql.com/docs/apollo-server/features/scalars-enums.html#custom-scalars) documentation for more information).

```diff
  const resolvers = {
    Query: {
      comments: async (parent, args, context, info) => {
        return Promise.resolve([
          { id: 1, body: `<p>Hello, world<script>console.log('👻')</script>!</p>` },
        ]);
      },
    },
+   HTML: new GraphQLHTML({
+     allowedTags: [...GraphQLHTML.defaults.allowedTags, 'img'],
+   }),
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
```

If you've used [sanitize-html](http://npm.im/sanitize-html) before, the options argument of `GraphQLHTML` should look familiar - in fact, the `options` you'll set here are passed directly to [sanitize-html](http://npm.im/sanitize-html).

<details>
  <summary>Not using <a href="https://www.apollographql.com/docs/apollo-server/">Apollo Server</a> or graphql-tools <a href="https://www.apollographql.com/docs/apollo-server/api/graphql-tools.html#makeExecutableSchema"><code>makeExecutableSchema</code></a>?</summary>
  <blockquote>So you like doing things the hard way? 😜 <code>GraphQLHTML</code> can be used with <a href="https://github.com/graphql/graphql-js">GraphQL.js</a> directly! See <a href="https://github.com/flesch/graphql-scalar-html/blob/master/examples/graphql-js">this example implementation</a> for more information.</blockquote>
</details>

## Contributing

[**graphql-scalar-html**](https://npm.im/graphql-scalar-html) is maintained by [John Flesch](mailto:john@fles.ch). Contributions are very much welcome!

## License

The MIT License (MIT)

Copyright (c) 2019 John Flesch <john@fles.ch> (https://github.com/flesch)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
