const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
} = require('graphql');
const GraphQLHTML = require('../../dist');

const HTML = new GraphQLHTML({
  allowedTags: [...GraphQLHTML.defaults.allowedTags, 'img'],
});

const Comment = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    id: {
      type: GraphQLID,
    },
    body: {
      type: HTML,
    },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      comments: {
        type: new GraphQLList(Comment),
        resolve: async (parent, args, context, info) => {
          return Promise.resolve([
            {
              id: 1,
              body: `<p>Hello, world<script>console.log('👻')</script>!</p>`,
            },
          ]);
        },
      },
    },
  }),
});

const query = `{ comments { id body } }`;

graphql(schema, query).then((result) => {
  console.log(JSON.stringify(result, null, 2));
});
