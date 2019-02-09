const { ApolloServer, gql } = require('apollo-server');
const GraphQLHTML = require('../../dist');

const typeDefs = gql`
  type Query {
    comments: [Comment]
  }

  type Mutation {
    addComment(input: AddCommentInput!): AddCommentPayload!
  }

  type Comment {
    id: ID!
    body: HTML
    createdAt: Int
  }

  input AddCommentInput {
    body: HTML
  }

  type AddCommentPayload implements MutationPayload {
    code: Int
    success: Boolean
    message: String
    comment: Comment
  }

  interface MutationPayload {
    code: Int
    success: Boolean
    message: String
  }

  scalar HTML
`;

const comments = [
  {
    id: 1,
    body: `Hello, world!<script>console.log('👻')</script>`,
    createdAt: Date.now(),
  },
];

const example = {
  query: `
    query comments {
      comments {
        id
        body
      }
    }
  `,
  mutation: `
    mutation addComment {
      addComment(input: { body:"Hello, world!\<script\>console.log('👻');\<\\/script\>" }) {
        code
        success
        message
        comment {
          id
          body
        }
      }
    }
  `,
};

const resolvers = {
  Query: {
    comments: async (parent, args, context, info) => {
      return Promise.resolve(comments);
    },
  },
  Mutation: {
    addComment: async (parent, args, context, info) => {
      comments.push({
        id: comments.length + 1,
        body: args.input.body,
        createdAt: Date.now(),
      });
      const [comment] = comments.slice().reverse();
      return Promise.resolve({
        code: 201,
        success: true,
        message: 'Your comment has been added!',
        comment: comment,
      });
    },
  },
  MutationPayload: {
    __resolveType: (parent, context, info) => {
      return info.schema.getType('AddCommentPayload');
    },
  },
  HTML: new GraphQLHTML({
    allowedTags: [...GraphQLHTML.defaults.allowedTags, 'img'],
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    tabs: [
      {
        name: 'Query.comments',
        endpoint: `http://localhost:4000`,
        query: example.query.trim().replace(/^\s{2,4}/gm, ''),
      },
      {
        name: 'Mutation.addComment',
        endpoint: `http://localhost:4000`,
        query: example.mutation.trim().replace(/^\s{2,4}/gm, ''),
      },
    ],
  },
});

server.listen().then(({ url }) => {
  console.log(`▶︎ ${url}`);
});
