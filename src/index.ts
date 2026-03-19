import { TSESTree, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => `https://github.com/apprlabs/eslint-plugin-sort-imports`,
);

type Section = { name: string; pattern: string; order: number };
type Options = Partial<{
  includeComments: boolean;
  sections: Section[];
}>;

const defaultIncludeComments = true;
const defaultSections: Section[] = [
  { name: 'Vendor', pattern: '^(?!\\.)(?!@\\/).*', order: 0 },
  { name: 'Internal', pattern: '^(\\.|@\\/).*', order: 1 },
];

export default createRule({
  name: 'sort-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Order imports by configurable sections with optional comments',
      url: 'https://github.com/apprlabs/eslint-plugin-sort-imports',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          includeComments: { type: 'boolean' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                pattern: { type: 'string' },
                order: { type: 'number' },
              },
              required: ['name', 'pattern', 'order'],
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unorderedImports:
        'Imports are not ordered properly according to the specified configuration.',
    },
  },
  defaultOptions: [{}],

  create(context, [options]) {
    const {
      includeComments = defaultIncludeComments,
      sections = defaultSections,
    }: Options = options || {};

    return {
      Program(node) {
        const sourceCode = context.sourceCode;
        const importStatements = node.body.filter(
          (n) => n.type === TSESTree.AST_NODE_TYPES.ImportDeclaration,
        );

        const categorizedImports: Record<string, TSESTree.ImportDeclaration[]> =
          {};

        // sort sections first by the `order` specified
        sections.sort(({ order: a }, { order: b }) => a - b);
        sections.push({ name: '(Unknown)', pattern: '.*', order: 999 });

        // create empty arrays for each section so we have a known-good value
        sections.forEach((section) => {
          categorizedImports[section.name] = [];
        });

        for (const importNode of importStatements) {
          const importPath = importNode.source.value as string;

          for (const section of sections) {
            try {
              const regexp = new RegExp(section.pattern);
              if (regexp.test(importPath)) {
                categorizedImports[section.name].push(importNode);
                break;
              }
            } catch (e) {
              /* eslint-disable */
              console.log(e);
            }
          }
        }

        Object.keys(categorizedImports).forEach((key) => {
          categorizedImports[key].sort((a, b) =>
            (a.source.value as string).localeCompare(b.source.value as string),
          );
        });

        const sortedSections = Object.entries(categorizedImports)
          .filter(([, imports]) => imports.length > 0)
          .map(([section, imports]) => {
            const sectionComment = includeComments ? `// ${section}\n` : '';
            return `${sectionComment}${imports
              .map((node) => sourceCode.getText(node))
              .join('\n')}`;
          });

        const sortedImports = sortedSections.join('\n\n');

        const firstImportNode = importStatements[0];
        let startRange = firstImportNode.range[0]; // Default to the first import's range

        if (includeComments) {
          const comments = sourceCode.getCommentsBefore(firstImportNode);
          if (comments.length > 0) {
            const firstComment = comments[0];
            startRange = firstComment.range[0];
          }
        }

        const lastImportNode = importStatements[importStatements.length - 1];
        if (
          sourceCode
            .getText()
            .slice(startRange, lastImportNode.range[1])
            .trim() !== sortedImports
        ) {
          context.report({
            node: firstImportNode,
            messageId: 'unorderedImports',
            fix(fixer) {
              return fixer.replaceTextRange(
                [startRange, lastImportNode.range[1]],
                sortedImports,
              );
            },
          });
        }
      },
    };
  },
});
