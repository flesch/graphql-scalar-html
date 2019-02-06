import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';
import sanitizeHtml, { defaults, simpleTransform } from 'sanitize-html';

function GraphQLHTML(options = {}) {
  const sanitizeValue = (value) => {
    if (typeof value !== 'string') {
      throw new TypeError(
        `HTML cannot represent a non string value: ${typeof value}`,
      );
    }
    return sanitizeHtml(value, options);
  };
  return new GraphQLScalarType({
    name: 'HTML',
    description:
      'The `HTML` scalar type represents Hypertext Markup Language, a ' +
      'standardized system for tagging text files to achieve font, color, ' +
      'graphic, and hyperlink effects on World Wide Web pages.',
    serialize: sanitizeValue,
    parseValue: sanitizeValue,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(
          `Can only sanitize HTML strings, but got: ${ast.kind}`,
        );
      }
      return sanitizeHtml(ast.value, options);
    },
  });
}

GraphQLHTML.defaults = defaults;
GraphQLHTML.simpleTransform = simpleTransform;

export default GraphQLHTML;
